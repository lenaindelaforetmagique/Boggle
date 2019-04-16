var dictionary = new DictionaryTree();



function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


document.getElementById('file').onchange = function() {
  var file = this.files[0];
  console.log(file);
  var reader = new FileReader();
  reader.onload = function(progressEvent) {
    // Entire file
    // console.log(this.result);

    // By lines
    var lines = this.result.split('\n');
    console.log(lines.length);
    for (var line = 0; line < lines.length; line++) {
      dictionary.addWord(lines[line]);
    }

    console.log(dictionary);
    // var file = JSON.stringify(dictionary);
    //
    // download("dico.json", file);

    // console.log(file);

  };
  reader.readAsText(file);
};