class TextBox {
  constructor(parent_) {
    this.dom = document.getElementById("textBox");
    this.text = "";
    this.initEvents();

    this.parent = parent_;
    this.dictionary = this.parent.solutionDictionary;
  }

  initEvents() {
    var thiz = this;
    document.onkeydown = function(e) {
      // console.log(e.which);
      if (e.key == " ") {
        e.preventDefault();
        // space bar
        thiz.submit();
      } else if (e.which == 8) {
        e.preventDefault();
        thiz.backspace();
      } else {
        var letter = e.key;
        letter = letter.toUpperCase();
        var inL = ["À", "É", "È", "Ç", "Ù"];
        var outL = ["A", "E", "E", "C", "U"];
        for (var i = 0; i < inL.length; i++) {
          letter = letter.replace(inL[i], outL[i]);
        }
        if ("ABCDEFGHJIKLMNOPQRSTUVWXYZ".indexOf(letter) > -1) {
          thiz.appendLetter(letter);
        }
      }
    }
  }

  submit() {
    this.parent.submit(this.text);
    this.clear();
  }

  appendLetter(letter) {
    letter = letter.toUpperCase();
    this.text += letter;
    this.update();
  }

  backspace() {
    this.text = this.text.substring(0, this.text.length - 1);
    this.update();
  }

  clear() {
    this.text = "";
    this.update();
  }

  update() {
    this.dom.innerHTML = this.text;
    if (this.dictionary.loaded) {
      var test = this.dictionary.testWord(this.text)
      if (test == 0) { // return "'" + word + "' n'existe pas !";
        this.dom.setAttribute("class", "false");
      } else if (test == 1) { // return "'" + word + "' existe mais n'est pas terminal";
        this.dom.setAttribute("class", "partial");
      } else if (test == 2) { // return "'" + word + "' existe et est terminal";
        this.dom.setAttribute("class", "ended");
      } else if (test == 3) { // return "'" + word + "' existe et est terminal";
        this.dom.setAttribute("class", "extendable");
      }
    }
  }
}


class BoardGame {
  constructor() {
    this.dom = document.getElementById("grid");
    this.grid = [];
    this.solutions = [];
    this.solutionDictionary = new DictionaryTree();
    this.textBox = new TextBox(this);

    this.foundWords = [];
    this.totalScore = 0;
    this.maxScore = 0;

    this.dices = [
      ["E", "T", "U", "K", "N", "O"],
      ["E", "V", "G", "T", "I", "N"],
      ["D", "E", "C", "A", "M", "P"],
      ["I", "E", "L", "R", "U", "W"],
      ["E", "H", "I", "F", "S", "E"],
      ["R", "E", "C", "A", "L", "S"],
      ["E", "N", "T", "D", "O", "S"],
      ["O", "F", "X", "R", "I", "A"],
      ["N", "A", "V", "E", "D", "Z"],
      ["E", "I", "O", "A", "T", "A"],
      ["G", "L", "E", "N", "Y", "U"],
      ["B", "M", "A", "Q", "J", "O"],
      ["T", "L", "I", "B", "R", "A"],
      ["S", "P", "U", "L", "T", "E"],
      ["A", "I", "M", "S", "O", "R"],
      ["E", "N", "H", "R", "I", "S"]
    ];

    var thiz = this;
    this.dictionary = new DictionaryTree();
    this.dictionary.onload = function() {
      thiz.resetGame();
    }
    this.dictionary.loadFile("FR_ods7.dic");

    // == Buttons ==
    this.resetButton = document.getElementById("resetButton");
    this.showSolutionButton = document.getElementById("solutionButton");
    this.submitButton = document.getElementById("submitButton");
    this.bckspButton = document.getElementById("bckspButton");
    this.scoreCell = document.getElementById("scoreCell");
    this.solutionsBox = document.getElementById("solutionsBox");

    this.load_events();
  }

  load_events() {
    var thiz = this;

    var handleReset = function(e) {
      console.log(e);
      thiz.resetGame();
    }
    this.resetButton.addEventListener("mousedown", handleReset, false);
    this.resetButton.addEventListener("touchstart", handleReset, false);

    var handleShowSolution = function() {
      thiz.showSolutions();
    }
    this.showSolutionButton.addEventListener("mousedown", handleShowSolution, false);
    this.showSolutionButton.addEventListener("touchstart", handleShowSolution, false);

    var handleSubmit = function() {
      thiz.textBox.submit();
    }
    this.submitButton.addEventListener("mousedown", handleSubmit, false);
    this.submitButton.addEventListener("touchstart", handleSubmit, false);

    var handleBcksp = function() {
      thiz.textBox.backspace();
    }
    this.bckspButton.addEventListener("mousedown", handleBcksp, false);
    this.bckspButton.addEventListener("touchstart", handleBcksp, false);
  }

  updateScore() {
    this.scoreCell.innerHTML = this.totalScore + " / " + this.maxScore + " points<br>" + this.foundWords.length + " / " + this.totalWords + " mots";
  }

  resetGame() {
    this.foundWords = [];
    this.totalScore = 0;
    this.maxScore = 0;
    this.solutions = [];
    this.solutionDictionary = new DictionaryTree();

    this.textBox.clear();
    this.init();
    this.solve();
    removeChildren(this.solutionsBox);
    this.updateScore();
  }

  showSolutions() {
    removeChildren(this.solutionsBox);
    for (var sol of this.solutions) {
      var p_ = document.createElement("div");
      p_.innerHTML = sol;
      if (this.foundWords.indexOf(sol) > -1) {
        // found
        p_.setAttribute("class", "found");
      } else {
        p_.setAttribute("class", "notFound");
        // not found
      }
      this.solutionsBox.appendChild(p_);
    }
  }

  updateFoundWords() {
    removeChildren(this.solutionsBox);
    this.foundWords.sort();
    for (var sol of this.foundWords) {
      var p_ = document.createElement("div");
      p_.innerHTML = sol;
      p_.setAttribute("class", "found");
      // p_.setAttribute("class", "notFound");
      this.solutionsBox.appendChild(p_);
    }
  }


  init() {
    var thiz = this;
    removeChildren(this.dom);

    this.dices = Shuffle(this.dices);
    for (var i = 0; i < 16; i++) {
      this.dices[i] = Shuffle(this.dices[i]);
    }

    this.grid = [];
    for (var i = 0; i < 4; i++) {
      this.grid.push([]);
      var line = document.createElement("tr");
      for (var j = 0; j < 4; j++) {
        var letter = this.dices[i * 4 + j][0];
        this.grid[i].push(letter);
        var letter = this.grid[i][j];
        var cell = document.createElement("td");
        line.appendChild(cell);

        var div = document.createElement("div");
        cell.appendChild(div);
        div.setAttribute("value", letter);
        var handleLetter = function() {
          thiz.textBox.appendLetter(this.getAttribute("value"));
          thiz.textBox.update();
        }
        div.addEventListener("mousedown", handleLetter, false);
        div.addEventListener("touchstart", handleLetter, false);

        var p = document.createElement("p");
        div.appendChild(p);


        if ("WZ".indexOf(letter) > -1) {
          var u_ = document.createElement("u");
          u_.innerHTML = letter;
          p.appendChild(u_);
        } else {
          p.innerHTML = letter;
        }
        var angle = Math.floor(Math.random() * 4) * 90;
        // div.setAttribute("style", "transform:rotate(" + angle + "deg)");
      }
      this.dom.appendChild(line);
    }
  }


  solve() {
    var currentState = [];
    for (var i = 0; i < 4; i++) {
      currentState[i] = [];
      for (var j = 0; j < 4; j++) {
        currentState[i][j] = 0;
      }
    }

    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        this.goDeeper(currentState, i, j, "");
      }
    }
    this.solutions.sort();
    for (var sol of this.solutions) {
      this.solutionDictionary.addWord(sol);
      this.maxScore += this.score(sol);
    }
    this.solutionDictionary.loaded = true;
    this.textBox.dictionary = this.solutionDictionary;
    this.totalWords = this.solutionDictionary.size;

    // console.log(this.solutions);
  }


  goDeeper(currentState, posi, posj, word) {
    if ((0 <= posi && posi < 4) && (0 <= posj && posj < 4)) {
      if (currentState[posi][posj] == 0) {
        word += this.grid[posi][posj];
        var res = this.dictionary.testWord(word);
        if (res > 0) {
          var newState = [];
          for (var i = 0; i < 4; i++) {
            newState[i] = [];
            for (var j = 0; j < 4; j++) {
              newState[i][j] = currentState[i][j];
            }
          }
          newState[posi][posj] = 1;

          if (res >= 2) {
            if (this.solutions.indexOf(word) == -1 && word.length > 2) {
              this.solutions.push(word);
            }
          }

          // explores neighboring
          this.goDeeper(newState, posi - 1, posj - 1, word);
          this.goDeeper(newState, posi - 1, posj, word);
          this.goDeeper(newState, posi - 1, posj + 1, word);
          this.goDeeper(newState, posi, posj - 1, word);
          this.goDeeper(newState, posi, posj + 1, word);
          this.goDeeper(newState, posi + 1, posj - 1, word);
          this.goDeeper(newState, posi + 1, posj, word);
          this.goDeeper(newState, posi + 1, posj + 1, word);
        }
      }
    }
  }

  score(word) {
    var len = word.length;
    var res = 0
    if (len == 3) {
      res = 1;
    } else if (len == 4) {
      res = 1;
    } else if (len == 5) {
      res = 2;
    } else if (len == 6) {
      res = 3;
    } else if (len == 7) {
      res = 5;
    } else if (len >= 8) {
      res = 11;
    }
    return res;
  }

  submit(word) {
    if (this.solutionDictionary.testWord(word) >= 2) {
      if (this.foundWords.indexOf(word) == -1) {
        this.totalScore += this.score(word);
        this.foundWords.push(word);
        this.updateScore();
        this.updateFoundWords();
      }
      this.solutionDictionary.removeWord(word);
      // console.log(this.solutionDictionary);
    }
  }
}