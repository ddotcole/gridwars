const net = require('net');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

const options = {
  ip: process.argv[2],
  port: 1337,
  screen: {
    smartCSR: true,
    title: 'Gridwars'
  },
  currency: {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  },
  grid: { 
    selectedBg: 'black',
    fg: 'white',
    label: 'Grid Overview',
    columnSpacing: 2, //in chars
    columnWidth: [22, 6, 18, 6] /*in chars*/ 
  },
  gen: { 
    keys: true,
    mouse: true,
    fg: 'white',
    label: 'Generation',
    columnSpacing: 2, //in chars
    columnWidth: [12, 6, 6], /*in chars*/ 
  },
  tie: { 
    keys: true,
    mouse: true,  
    fg: 'white',
    label: 'Tie Line Market',
    columnSpacing: 2, //in chars
    columnWidth: [20, 12, 6] /*in chars*/ 
  },
  finance: { 
    fg: 'white',
    selectedBg: 'black',
    label: 'Financial Report',
    columnSpacing: 2, //in chars
    columnWidth: [18, 10] /*in chars*/ 
  },
  display: {
    scrollable: true,
    allwaysScroll: true,
    tags: true,
    label: 'Message Board'
  },
  input: {
    inputOnFocus: true,
    mouse: true,
    label: 'Input Message',
    style: {
      focus: { 
        border: { fg: 'red' }
      }
    },
  },
  prompt: { 
    keys: true,
    mouse: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    style: {
      border: { fg: 'red' }
    }
  },
  message: { 
    keys: true,
    mouse: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    style: {
      border: { fg: 'red' }
    }
  },
  form: { 
    keys: true,
    mouse: true,
    label: 'Tie Line Input',
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
  }
}

class Company {
    constructor(name) {
      this.name = name;
      this.gen = {};
      this.tie = {};
      this.CustomerLoad = 500;
    }
    total(item, prop) {
      let accum = 0;
      Object.keys(this[item]).forEach(i => accum += this[item][i][prop]);
      return accum;
    }
    cost(item, prop) {
      let accum = 0;
      Object.keys(this[item]).forEach(i => accum += this[item][i][prop]);
      return accum.toLocaleString('en-US', options.currency);
    }
    data(item) {
      let arr = [];
      if(Object.keys(this[item]).length === 0){return arr;}
      else {
        Object.keys(this[item]).forEach(i => { arr[i] = [this[item][i].name, this[item][i].output, this[item][i].price.toLocaleString('en-US', options.currency)]; });
        return arr;
      }
    }
    overview() {
      let arr = [];
      arr[0] = ['Customer Load', company.CustomerLoad, 'Up Room', company.total('gen', 'upRoom')];
      arr[1] = ['Online Generation', company.total('gen', 'output'), 'Down Room', company.total('gen', 'downRoom')];
      arr[2] = ['Tie Line Flow', company.total('tie', 'output')];
      arr[3] = ['Generation Balance', (company.total('gen', 'output') - company.total('tie', 'output')) - company.CustomerLoad];
      return arr;
    }
    report() {
      let arr = [];
      arr[0] = ['Customer Income', '$35,000'];
      arr[1] = ['Market Income', '$15,000'];
      arr[2] = ['Generation Cost', '$25,000'];
      arr[3] = ['Market Cost', '$5,000'];
      arr[4] = ['Profit', '$20,000'];
      return arr;
    }
}
class Generator {
    constructor(a,b,c,d,e,f) {
      this.name = a;
      this.online = b;
      this.output = c;
      this.price = d;
      this.loOprLmt = e;
      this.hiOprLmt = f;
    }
    get upRoom() { return this.hiOprLmt - this.output; }
    get downRoom() { return this.output - this.loOprLmt; }
    get dailyCost() { return this.output * this.price; }
    set genOutput(value) { 
      if(value >= this.loOprLmt && value <= this.hiOprLmt){
        this.output = value
      }else{
        message.display(`Entered value is outside ${this.name}'s operating range:
        \n   High Operating Limit: ${this.hiOprLmt}\n   Low Operating Limit: ${this.loOprLmt}
        \nPress "e" to re-enter value or "esc" to close message ...`, 0);
      }

    }
}
class TieLine {
    constructor(a, b, c, d, e, f) {
      this.name = a;
      this.available = b;
      this.output = c;
      this.price = d;
      this.importLmt = e;
      this.exportLmt = f;
    }
    get dailyCost() { return this.flow * this.price; }
}

let company = new Company(process.argv[3]);

var client = new net.Socket();
client.connect(options.port, options.ip, function() {
  client.write(`{"task":"connect", "company":"${company.name}"}`);
});
client.on('data', function(data) {
  let res = JSON.parse(data);
  if(res.task === "message"){
    let color = 'red';
    if(company.name == res.company){
      color = 'green';
    }
    display.pushLine(`{${color}-fg}${res.company}{/${color}-fg}: ${res.message}`);
    display.scrollTo(`${display.getScrollHeight()}`);
    screen.render();
  }
  if(res.task === "ties"){
    company.tie = {}
    for(i in res.ties){
      if(company.name !== res.ties[i]){
        company.tie[i] = new TieLine(res.ties[i], 1, 0, 16, -200, 150);
      }
    }
    render();
  }
});
client.on('close', function() {
  
});


// Initalize Layout
var screen = blessed.screen(options.screen)
var grid = new contrib.grid({rows: 6, cols: 3, screen: screen})
var tableGrid = grid.set(0, 0, 2, 2, contrib.table, options.grid)
var tableGen = grid.set(2, 0, 2, 1, contrib.table, options.gen)
var tableTie = grid.set(4, 0, 2, 1, contrib.table, options.tie)
var tableFinance = grid.set(0, 2, 2, 1, contrib.table, options.finance)
var display = grid.set(2, 2, 3, 1, blessed.text, options.display)
var input = grid.set(5, 2, 1, 1, blessed.textarea, options.input)
var prompt = grid.set(2, 1, 2, 1, blessed.prompt, options.prompt)
var message = grid.set(2, 1, 2, 1, blessed.message, options.message)
// Form
var form = grid.set(2, 1, 2, 1, blessed.form, {
  parent: screen,
  width: '100%',
  left: 'center',
  keys: true
});
var labelSchedule = blessed.text({
  parent: form,
  top: 1,
  left: 5,
  content: 'Schedule:'
});
var schedule = blessed.textbox({
  parent: form,
  mouse: true,
  name: 'schedule',
  top: 1,
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
var labelPrice = blessed.text({
  parent: form,
  content: '$/MWh:',
  top: 3,
  left: 5 
});
var price = blessed.textbox({
  parent: form,
  mouse: true,
  name: 'price',
  top: 3,
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
var available = blessed.checkbox({
  parent: form,
  top: 6,
  left: 5,
  width: 15,
  mouse: true,
  name: 'availability',
  content: 'Available',
  
});
var submit = blessed.button({
  parent: form,
  mouse: true,
  name: 'submit',
  content: 'Submit',
  top: 9,
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
  top: 9,
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

// Events
tableGen.on('element focus', function() { this.style.border = { fg: 'red' }; });
tableGen.on('element blur', function() { this.style.border = { fg: 'cyan' }; });
tableGen.on('element keypress', function(el, _ch, key) {
  if(key.name === 'e'){
    prompt.input(`Change ${company.gen[el.selected].name} MW's to:`, '', function(err, result){
      let value = parseInt(result);
      if(typeof value==='number' && (value%1)===0){
        company.gen[el.selected].genOutput = value;
      }
      render();
    });
  }
  if(key.name === 'i'){
    message.display(`${company.gen[el.selected].name}\n
    Online: ${company.gen[el.selected].online}
    Output: ${company.gen[el.selected].output}
    Price: ${company.gen[el.selected].price}
    Low OperLmt: ${company.gen[el.selected].loOprLmt}
    High OperLmt: ${company.gen[el.selected].hiOprLmt}`, 0);
  }
  if (el === tableGen) {
    return false; // Cancel propagation.
  }
});
tableTie.on('element focus', function() { this.style.border = { fg: 'red' }; });
tableTie.on('element blur', function() { this.style.border = { fg: 'cyan' }; });
tableTie.on('element keypress', function(el, _ch, key) {
  if(key.name === 'e'){
    company.currentFocus = el.selected
    form.show()
    form.focus()
    screen.render();
  }
  if(key.name === 'i'){
    message.display(`${company.tie[el.selected].name}\n
    Availability: ${company.tie[el.selected].available}
    Schedule: ${company.tie[el.selected].output}
    $/MWh: ${company.tie[el.selected].price}
    Import Limit: ${company.tie[el.selected].importLmt}
    Export Limit: ${company.tie[el.selected].exportLmt}`, 0);
  }
  if (el === tableTie) {
    return false; // Cancel propagation.
  }
});
form.on('element focus', function() { this.style.border = { fg: 'red' }; });
form.on('element blur', function() { this.style.border = { fg: 'cyan' }; });
input.key('enter', function() {
  let string = input.getValue().replace(/(\r\n|\n|\r)/gm, "");
  if(string != ''){
    client.write(`{"task":"message","company":"${company.name}","message":"${string}"}`);
  }
  input.clearValue();
  input.scrollTo(0);
  this.screen.focusPop();
  screen.render();
});
screen.key(['q', 'C-c'], function(ch, key) {
  client.end(`{"task":"disconnect", "company":"${company.name}"}`)
  process.kill(process.pid, 'SIGTERM');
});
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
  company.tie[company.currentFocus].output = parseInt(data.schedule)
  company.tie[company.currentFocus].price = parseInt(data.price)
  company.tie[company.currentFocus].available = data.available
  form.reset()
  form.hide()
  render()
});
form.on('reset', function () {
  screen.render()
});


// Main Program
parseArgv();
function parseArgv() {
  if(process.argv.length < 4) {
    console.log(`Start the game by typing the following:`)
    console.log(`     node gridwars.js <Server IP Address> <Company Name>`)
    process.exit(1)
  }
}
init();
function init() {
  company.gen[0] = new Generator('Poplar', 1, 270, 25, 200, 300);
  company.gen[1] = new Generator('Coteau', 1, 55, 5, 45, 62);
  company.gen[2] = new Generator('Ermine', 1, 35, 30, 25, 45);
  display.pushLine(`{yellow-fg}Welcome to Gridwars{/yellow-fg} {green-fg}${company.name}{/green-fg}.`);
  message.hide()
  form.hide()
  render();
}
function render(){
  tableGrid.setData({ 
    headers: ['Total', 'MW', 'Total', 'MW'],
    data: company.overview()
  }) 
  tableGen.setData({ 
      headers: ['Plant', 'Output', 'Cost'],
      data: company.data('gen')
    })
  tableTie.setData({ 
      headers: ['Utility', 'Schedule', '$/MWh'],
      data: company.data('tie')
    })
  tableFinance.setData({ 
    headers: ['Inc/Cost', 'Value'],
    data: company.report()
  })
  screen.render();
}