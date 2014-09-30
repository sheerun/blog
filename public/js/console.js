// This code is not supposed to be pretty :)

function insertAtCursor(myField, myValue) {
  if (document.selection) {
      myField.focus();
      sel = document.selection.createRange();
      sel.text = myValue;
  } else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      var endPos = myField.selectionEnd;
      myField.value = myField.value.substring(0, startPos)
          + myValue
          + myField.value.substring(endPos, myField.value.length);
  } else {
      myField.value += myValue;
  }
}

function moveCaretToEnd(el) {
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

var prompt = document.getElementById('prompt');
var output = document.getElementById('output');
var tries = 0;

prompt.parentNode.addEventListener('click', function() {
  prompt.focus();
});

output.parentNode.addEventListener('click', function(e) {
  e.stopPropagation();
});

prompt.addEventListener('keydown', function(e) {
  var code = e.keyCode || e.which;

  if (code == 8) {
    insertAtCursor(prompt, '^H');
    e.stopPropagation();
    e.preventDefault();
  }

  var insertText = function(text) {
      var el = document.createElement("div");
      el.innerText = el.textContent = prompt.value + "\n" + text;
      text = el.innerHTML;
      prompt.value = "$ ";
      output.innerHTML += text;
      e.stopPropagation();
      e.preventDefault();
      setTimeout(function() {
        prompt.parentNode.scrollTop = prompt.parentNode.scrollHeight;
      }, 1);
  }

  if (code == 13) {
    if (prompt.value.substring(2, 5) == 'cat') {
      insertText("zsh: segmentation fault");
      prompt.style.display = 'none';
      prompt.disabled = true;
      output.style.color = 'gray'
    } else {
      insertText("zsh: command not found: " + prompt.value.substring(2) + "\n\n");
    }

    tries += 1;
  }
});

prompt.addEventListener('keyup', function(e) {
  if (prompt.style.height != prompt.scrollHeight) {
    prompt.style.height = (prompt.scrollHeight) + 'px';
  }
})

function focusPrompt() {
  moveCaretToEnd(prompt);

  window.setTimeout(function() {
    moveCaretToEnd(prompt);
  }, 1);
}

prompt.addEventListener('focus', focusPrompt);
prompt.addEventListener('mousedown', focusPrompt);
