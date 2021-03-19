
const board = (() => {
  const fields = [];

  events.on('boardClean', function(data) {
    if (data) {
      clearBoard();
    }
  });

  events.on('fieldAdded', function(data) {
    addToField(data[0], data[1].sign);
  });

  const getFields = () => fields;

  const addToField = (place, value) => {
    fields[place] = value;
  };

  const clearBoard = () => {
    fields.length = 0;
  };

  return {getFields, addToField, clearBoard}  
})();

var player = {
  create: function(values) {
    var instance = Object.create(this);
    Object.keys(values).forEach(function(key) {
      instance[key] = values[key];
    });
    return instance;
   },
};

var player1 = player.create({
  name: 'Joe',
  sign: 'cross'
})

var player2 = player.create({
  name: 'Sue',
  sign: 'circle'
})

var gamePlay = (() => {
  var activePlayer =  player1;

  var change = () => {
    if (activePlayer == player1) {
      activePlayer = player2;
    } else {
      activePlayer = player1;
    }
  };

  var gameType = document.querySelector('#type-of-game');
  var gameContainer = document.querySelector('.container');
  var chatButton = document.querySelector('.chat-button');
  var messageContainer = document.querySelector('.chat-window');

  chatButton.addEventListener('click', function(e) {
    messageContainer.classList.add('d-none');
    var messContent = document.querySelector('.message-content');
    while (messContent.firstChild) {
      messContent.removeChild(messContent.firstChild);
    }
  });

  gameType.addEventListener('submit', function(e) {
    var choseRadio = document.getElementsByName('gametype');
    gameContainer.classList.remove('d-none');
    gameType.classList.add('d-none');
    for (let index = 0; index < choseRadio.length; index++) {
      if (choseRadio[index].checked) {
        if (choseRadio[index].value == 'ai') {
          player2.name = 'ai';
        } else {
          player2.name = 'Sue';
        }
      } 
    }
    e.preventDefault();
  });

  var displayBoard = document.querySelector('.board');

  for (let index = 0; index < 9; index++) {
    var elem = document.createElement('li');
    elem.className = "board-element";
    displayBoard.appendChild(elem);
  }

  var field = document.querySelectorAll('.board-element')

  function addSign(target, value) {
    if (!target.hasChildNodes()) {
      var fieldContent = document.createElement('div');
      fieldContent.className = value;
      target.appendChild(fieldContent);
    } else {
      showMessage('Illegal move!', 'Field is occupied!');
      change();
    }
  }

  var showMessage = (title, content) => {
    var messageContent = document.querySelector('.message-content');
    var messageTitle = document.createElement('h1');
    messageTitle.innerHTML = title;
    var messageBody = document.createElement('p');
    messageBody.innerHTML = content;
    messageContent.appendChild(messageTitle);
    messageContent.appendChild(messageBody);
    messageContainer.classList.remove('d-none');
  };

  for (let index = 0; index < field.length; index++) {
    field[index].addEventListener('click', function(e) {
      gameMove(index);
      if (player2.name == "ai") {
        setTimeout(() => {
          aiPlay();
        }, 300);
      }
    });  
  }

  var aiPlay = () => {
    if (activePlayer == player2) {
      do {
        var aiMove = Math.floor(Math.random() * 9);
      } while (field[aiMove].hasChildNodes());
      gameMove(aiMove);
    }
  };

  var gameMove = (index) => {
    addSign(field[index], activePlayer.sign);
    events.emit('fieldAdded', [index, activePlayer]);
    checkWinner(board.getFields());
    if (!checkWinner(board.getFields())) {
      change();
    }
  };

  var checkWinner = function(fields) {
    const modifier = [0, 3, 6];
    let result = false;

    for (let i = 0; i < modifier.length; i++) {
      if (fields[modifier[i]] != undefined && fields[modifier[i]] == fields[modifier[i] + 1]
        && fields[modifier[i]] == fields[modifier[i] + 2] || fields[i] != undefined &&
        fields[i] == fields[i + 3] && fields[i] == fields[i + 6] || fields[0] != undefined
        && fields[0] == fields[4] && fields[0] == fields[8] || fields[4] != undefined &&
        fields[2] == fields[4] && fields[4] == fields[6]){
        if (activePlayer.name == 'ai') {
          var messTitle = 'Looser';
          var messBody = 'Better luck next time';
        } else {
          var messTitle = 'Congrats to ' + activePlayer.name;
          var messBody = 'You rock!';
        }
        showMessage(messTitle, messBody);
        removeAll();
        events.emit('boardClean', true);
        result = true;
        break;
      } else if (fields.length == 9 && !fields.includes(undefined)) {
        showMessage('Draw', 'It\'s a draw');
        removeAll();
        events.emit('boardClean', true);
        result = true;
        break;
      }
    }
    return result;
  };
  
  var removeAll = function() {
    var liElements = document.querySelectorAll('li');
    for (let index = 0; index < liElements.length; index++) {
      const element = liElements[index];
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }        
    }
  }

  // reset & new game buttons

  var buttons = ['newButton', 'resetButton']
  
  var controllers = document.querySelector('.controllers');
  for (let i = 0; i < buttons.length; i++) {
    var button = document.createElement('button');
    button.classList.add(buttons[i]);
    if (buttons[i] == 'newButton') {
      button.innerHTML = 'Reset board';
      button.addEventListener('click', function(e) {
        removeAll();
        board.clearBoard();
        e.preventDefault();
      });
    } else {
      button.innerHTML = 'New game';
      button.addEventListener('click', function(e) {
        removeAll();
        board.clearBoard();
        gameContainer.classList.add('d-none');
        gameType.classList.remove('d-none');
        e.preventDefault();
      });
    }
    controllers.appendChild(button);
  } 
})();
