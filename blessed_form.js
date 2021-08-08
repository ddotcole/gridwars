var blessed = require('blessed'),
    fs = require('fs');
// Screen
var screen = blessed.screen({
  smartCSR: true,
  title: 'Blessed Form'
});
// Form
var form = blessed.form({
  parent: screen,
  width: '100%',
  left: 'center',
  keys: true
});
// Text boxes
var label1 = blessed.text({
  parent: form,
  top: 2,
  left: 5,
  content: 'Schedule:'
});
var schedule = blessed.textbox({
  parent: form,
  mouse: true,
  name: 'schedule',
  top: 2,
  left: 15,
  height: 1,
  width: 4,
  style: {
    bg: 'grey',
    focus: {
      bg: 'white',
      fg: 'black',
    }
  }
});
var label2 = blessed.text({
  parent: form,
  content: '$/MWh:',
  top: 5,
  left: 8 
});
var price = blessed.textbox({
  parent: form,
  mouse: true,
  name: 'price',
  top: 5,
  left: 15,
  height: 1,
  width: 4,
  style: {
    bg: 'grey',
    focus: {
      bg: 'white',
      fg: 'black',
    }
  }
});
// Check Box
var available = blessed.checkbox({
  parent: form,
  top: 8,
  mouse: true,
  name: 'availability',
  content: 'Available',
  left: 8
});
// Submit/Cancel buttons
var submit = blessed.button({
  parent: form,
  mouse: true,
  name: 'submit',
  content: 'Submit',
  top: 11,
  left: 5,
  shrink: true,
  padding: {
    top: 0,
    right: 1,
    bottom: 0,
    left: 1
  },
  style: {
    bold: true,
    fg: 'white',
    focus: {
      inverse: true
    }
  }
});
var reset = blessed.button({
  parent: form,
  mouse: true,
  name: 'reset',
  content: 'Reset',
  top: 11,
  left: 18,
  shrink: true,
  padding: {
    top: 0,
    right: 1,
    bottom: 0,
    left: 1
  },
  style: {
    bold: true,
    fg: 'white',
    focus: {
      inverse: true
    }
  }
});
// Event management
schedule.on('focus', function () {
  schedule.readInput()
});
price.on('focus', function () {
  price.readInput()
});
submit.on('press', function () {
  form.submit();
});
reset.on('press', function () {
  form.reset();
});
form.on('submit', function (data) {
  
});
form.on('reset', function () {
  screen.render()
});
// Key bindings
screen.key('q', function () {
  this.destroy();
});
// Render everything!
screen.render();