class DictionaryTree {
  constructor() {
    this.tree = new LetterNode("");
    this.size = 0;
    this.loaded = false;

    // this.loadFile(fileURL);
  }

  addWord(word) {
    word = word.replace("\r", "");
    this.tree.addSuffix(word);
    this.size++;
  }

  testWord(word) {
    return this.tree.testSuffix(word);
  }

  onload() {
    // EMPTY
    console.log('termine');
    console.log(thiz.tree);
  }

  loadFile(fileURL) {
    var thiz = this;
    // var saved = this.getSavedHistory("boggle*" + fileURL);
    // if (saved != null) {
    //   this.tree = saved.tree;
    //   this.size = saved.size;
    //   this.loaded = saved.loaded;
    // } else {

    var request = new XMLHttpRequest();
    request.onload = function() {
      var lines = request.response.split('\n');
      for (var i = 0; i < lines.length; i++) {
        thiz.addWord(lines[i]);
      }
      thiz.loaded = true;
      // thiz.saveHistory("boggle*" + fileURL);
      thiz.onload();
    };
    request.open("GET", fileURL);
    request.responseType = "txt";
    request.send();
    // }
  }

  saveHistory(historyID) {
    localStorage[historyID] = JSON.stringify(this);
  }

  getSavedHistory(historyID) {
    var hist = [];
    var stored = localStorage[historyID];
    if (stored) {
      return JSON.parse(stored);
    } else {
      return null;
    }
  }

}

class LetterNode {
  constructor(face) {
    this.face = face;
    this.ended = false;
    this.children = [];
  }

  addSuffix(suffix) {
    if (suffix.length > 0) {
      var firstLetter = suffix.substring(0, 1);
      //find children
      var i = 0;
      while (i < this.children.length && firstLetter != this.children[i].face) {
        i++;
      }
      if (i == this.children.length) {
        this.children.push(new LetterNode(firstLetter));
      }
      this.children[i].addSuffix(suffix.substring(1));
    } else {
      this.ended = true;
    }
  }

  testSuffix(suffix) {
    if (suffix.length > 0) {
      var firstLetter = suffix.substring(0, 1);
      var i = 0;
      while (i < this.children.length && firstLetter != this.children[i].face) {
        i++;
      }
      if (i == this.children.length) {
        return 0; // not found
      } else {
        return this.children[i].testSuffix(suffix.substring(1));
      }
    } else {
      if (this.ended) {
        if (this.children.length > 0) {
          return 3;
        } else {
          return 2; // found complete word
        }
      } else {
        return 1; // found starting of a word
      }
    }
  }
}