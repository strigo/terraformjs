'use strict';

const sh = require('shelljs');
const which = require('which');

// var terraform = which.sync('terraforms')

function _assertTerraformExecutableInPath() {
  which('terraform', function (err, resolvedPath) {
    // er is returned if no "terraform" is found on the PATH
    // if it is found, then the absolute path to the exec is returned
    if (err)
      throw('The `terraform` executable could not be found in the path')
    return resolvedPath
  })
}


let version = function showVersion() {
  outcome = sh.exec('terraform --version', {silent: true});
  version = outcome.stdout.split(' ')[1].slice(1, -1);
  return version;
}


class Terraform {

  constructor (workDir = process.cwd(),
               silent = false,
               no_color = false) {
    this.workDir = workDir;
    this.silent = silent;
    this.no_color = no_color;
  }

  _normalizeArg(arg) {
    arg = arg.replace('_', '-');
    arg = `-${arg}`;
    return arg;
  }

  _executeTerraformCommand(subCommand, optString) {
    let command = `terraform ${subCommand}`;

    if (typeof optString !== 'undefined') {
      command += optString;
    }
    if (this.no_color) {
      command += ' -no-color';
    }

    throw('XXXXXXX')
    return sh.exec(command, {silent: this.silent});
  }

  _generateArgString(args) {
    let optString = '';

    for (let arg in args) {
      // console.log(`${arg}: ${args[arg]}`, typeof args[arg]);
      if (arg == 'var') {
        // TODO: handle `var` object is empty
        for (let v in args[arg]) {
          optString += ` -var '${v}=${args[arg][v]}'`;
        }
      }
      else if (typeof args[arg] === 'boolean') {
        if (args[arg]) {
          optString += ` -${arg}`;
        }
      }
      else {
        optString += ` ${this._normalizeArg(arg)}=${args[arg]}`;
      }
    }
    return optString
  }

  _cmd(subCommand, args) {

    let cwd = process.cwd();
    process.chdir(this.workDir);

    let optString = this._generateArgString(args);
    let outcome = this._executeTerraformCommand(subCommand, optString);

    process.chdir(cwd);
    return outcome;
  }

  /**
   * Execute `terraform apply`
   * @param {String} dirOrPlan (default: cwd)
   * @return {Object} outcome
   */
  apply(dirOrPlan, args) {
    let commandString = 'apply ' + (typeof dirOrPlan === 'undefined' ? '' : dirOrPlan);
    return this._cmd(commandString, args);
  }

  destroy(dir, args) {
    let commandString = 'destroy ' + (typeof dir === 'undefined' ? '' : dir);
    return this._cmd(commandString, args);
  }

  console(dir, args) {
    let commandString = 'console ' + (typeof dir === 'undefined' ? '' : dir);
    return this._cmd(commandString, args);
  }

  fmt(dir, args) {
    let commandString = 'fmt ' + (typeof dir === 'undefined' ? '' : dir);
    return this._cmd(commandString, args);
  }

  get(path = process.cwd(), args) {
    let commandString = `get ${path}`;
    return this._cmd(commandString, args);
  }

  graph(dir, args) {
    let commandString = 'graph ' + (typeof dir === 'undefined' ? '' : dir);
    return this._cmd(commandString, args);
  }

  import(addrId, args) {
    let commandString = `graph ${addrId}`;
    return this._cmd(commandString, args);
  }

  init(source, path, args) {
    let commandString = `init ${source} ` + (typeof path === 'undefined' ? '' : path);
    return this._cmd(commandString, args);
  }

  output(name, args) {
    let commandString = 'output ' + (typeof name === 'undefined' ? '' : name);
    return this._cmd(commandString, args);
  }

  plan(dirOrPlan, args) {
    let commandString = 'plan ' + (typeof dirOrPlan === 'undefined' ? '' : dirOrPlan);
    return this._cmd(commandString, args);
  }

  push(dir, args) {
    let commandString = 'push ' + (typeof dir === 'undefined' ? '' : dir);
    return this._cmd(commandString, args);
  }

  refresh(dir, args) {
    let commandString = 'refresh ' + (typeof dir === 'undefined' ? '' : dir);
    return this._cmd(commandString, args);
  }

  // TODO: Implement `remote` support (which requires subcommands)

  show(path, args) {
    let commandString = 'show ' + (typeof path === 'undefined' ? '' : path);
    return this._cmd(commandString, args);
  }

  taint(name, args) {
    let commandString = `taint ${name}`;
    return this._cmd(commandString, args);
  }

  untaint(name, args) {
    let commandString = `untaint ${name}`;
    return this._cmd(commandString, args);
  }

  validate(path, args) {
    let commandString = 'validate ' + (typeof path === 'undefined' ? '' : path);
    return this._cmd(commandString, args);
  }

}

module.exports.Terraform = Terraform;
module.exports.version = version;


let tf = new Terraform('./', true, true);
// tf.apply({'state': 'my-state-file.tfstate',
//           'var': {'foo': 'bar', 'bah': 'boo'},
//           'var_file': 'varfile', '-'})

// tf.destroy('my-dir', {'force': true, 'parallelism': 10});
tf.get()
