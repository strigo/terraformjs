'use strict';

const sh = require('shelljs');
const which = require('which');

/**
* Assert that the terraform executable is found in the path
* @return terraform absolute path
*/
function _assertTerraformExecutableInPath() {
  which('terraform', function (err, resolvedPath) {
    // er is returned if no "terraform" is found on the PATH
    // if it is found, then the absolute path to the exec is returned
    if (err)
      throw('The `terraform` executable could not be found in the path')
    return resolvedPath
  })
}


/**
* Retrieve a stripped version of terraform's executable version.
* e.g. (Terraform v0.8.5 => 0.8.5)
*/
let version = function showVersion() {
  let outcome = sh.exec('terraform --version', {silent: true});
  const parsedVersion = outcome.stdout.split(' ')[1].slice(1, -1);
  return parsedVersion;
}


/**
 * Execute terraform commands
 * @todo: Implement `remote`, `debug` and `state` support (which require subcommands)
 * @todo: Assert that terraform exists before allowing to perform actions
 * @todo: once finalized, document each command
 * @param {String} workDir (default: cwd)
 * @param {Boolean} silent (default: false)
 * @param {Boolean} no_color (default: false)
 */
class Terraform {

  constructor (workDir = process.cwd(),
               silent = false,
               no_color = false) {
    this.workDir = workDir;
    this.silent = silent;
    this.no_color = no_color;
  }

  /**
   * Normalize an option.
   * e.g. Converts `vars_file` to `-vars-file`.
   * @param {String} option string to normalize
   * @return {String} normalized.
   */
  _normalizeArg(opt) {
    opt = opt.replace('_', '-');
    opt = `-${opt}`;
    return opt;
  }

  /**
  * Construct a string from an object of options
  *
  *  For instance:
  *    {
  *      'state': 'state.tfstate',
  *      'var': {
  *        'foo': 'bar',
  *        'bah': 'boo'
  *      },
  *      'vars_file': [
  *        'x.tfvars',
  *        'y.tfvars'
  *      ]
  *    }
  * will be converted to:
  *   `-state=state.tfstate -var 'foo=bar' -var 'bah=boo' -vars-file=x.tfvars -vars-file=y.tfvars`
  * @param {Object} opts - an object of options
  * @return {String} optString - a string of options
  */
  _constructOptString(opts) {
    let optString = '';

    for (let option in opts) {
      if (option === 'var') {
        // TODO: handle `var` object is empty
        for (let v in opts[option]) {
          optString += ` -var '${v}=${opts[option][v]}'`;
        }
      }
      else if (typeof opts[option] === 'boolean') {
        if (opts[option]) {
          optString += ` -${option}`;
        }
      }
      else if (Array.isArray(opts[option])) {
        for (let item of opts[option]) {
          optString += ` ${this._normalizeArg(option)}=${item}`;
        }
      }
      else {
        optString += ` ${this._normalizeArg(option)}=${opts[option]}`;
      }
    }
    return optString;
  }

  /**
  * Execute a terraform subcommand with its arguments and options
  * @param {String} subCommand - the name of the subcommand to run
  * @param {String} args - an object of terraform command options
  * @return {Object} shelljs exec object
  */
  _cmd(subCommand, args) {

    let command = `terraform ${subCommand}`;
    let optString = this._constructOptString(args);

    let cwd = process.cwd();
    process.chdir(this.workDir);

    if (typeof optString !== 'undefined') {
      command += optString;
    }
    if (this.no_color) {
      command += ' -no-color';
    }
    const outcome = sh.exec(command, {silent: this.silent});

    process.chdir(cwd);
    return outcome;
  }

  apply(dirOrPlan, args) {
    let commandString = 'apply' + (typeof dirOrPlan === 'undefined' ? '' : ` ${dirOrPlan}`);
    return this._cmd(commandString, args);
  }

  destroy(dir, args) {
    let commandString = 'destroy' + (typeof dir === 'undefined' ? '' : ` ${dir}`);
    return this._cmd(commandString, args);
  }

  console(dir, args) {
    let commandString = 'console' + (typeof dir === 'undefined' ? '' : ` ${dir}`);
    return this._cmd(commandString, args);
  }

  fmt(dir, args) {
    let commandString = 'fmt' + (typeof dir === 'undefined' ? '' : ` ${dir}`);
    return this._cmd(commandString, args);
  }

  get(path = process.cwd(), args) {
    let commandString = `get ${path}`;
    return this._cmd(commandString, args);
  }

  graph(dir, args) {
    let commandString = 'graph' + (typeof dir === 'undefined' ? '' : ` ${dir}`);
    return this._cmd(commandString, args);
  }

  import(addrId, args) {
    let commandString = `graph ${addrId}`;
    return this._cmd(commandString, args);
  }

  init(source, path, args) {
    let commandString = `init ${source}` + (typeof path === 'undefined' ? '' : ` ${path}`);
    return this._cmd(commandString, args);
  }

  output(name, args) {
    let commandString = 'output' + (typeof name === 'undefined' ? '' : ` ${name}`);
    return this._cmd(commandString, args);
  }

  plan(dirOrPlan, args) {
    let commandString = 'plan' + (typeof dirOrPlan === 'undefined' ? '' : ` ${dirOrPlan}`);
    return this._cmd(commandString, args);
  }

  push(dir, args) {
    let commandString = 'push' + (typeof dir === 'undefined' ? '' : ` ${dir}`);
    return this._cmd(commandString, args);
  }

  refresh(dir, args) {
    let commandString = 'refresh' + (typeof dir === 'undefined' ? '' : ` ${dir}`);
    return this._cmd(commandString, args);
  }

  show(path, args) {
    let commandString = 'show' + (typeof path === 'undefined' ? '' : ` ${path}`);
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
    let commandString = 'validate' + (typeof path === 'undefined' ? '' : ` ${path}`);
    return this._cmd(commandString, args);
  }

}

module.exports.Terraform = Terraform;
module.exports.version = version;
