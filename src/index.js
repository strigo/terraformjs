const sh = require('shelljs');


/**
* Retrieve a stripped version of terraform's executable version.
* e.g. (Terraform v0.8.5 => 0.8.5)
*/
const version = function showVersion() {
  const outcome = sh.exec('terraform --version', { silent: true });
  const parsedVersion = outcome.stdout.split('\n')[0].split(' ')[1].substr(1);
  return parsedVersion;
};


/**
 * Execute terraform commands
 * @todo: Implement `remote`, `debug` and `state` support (which require subcommands)
 * @todo: Assert that terraform exists before allowing to perform actions
 * @todo: once finalized, document each command
 * @param {String} workDir (default: cwd)
 * @param {Boolean} silent (default: false)
 * @param {Boolean} noColor (default: false)
 */
class Terraform {

  constructor(workDir = process.cwd(), silent = false, noColor = false) {
    this.workDir = workDir;
    this.silent = silent;
    this.noColor = noColor;
  }

  /**
   * Normalize an option.
   * e.g. Converts `vars_file` to `-vars-file`.
   * @param {String} option string to normalize
   * @return {String} normalized.
   */
  static normalizeArg(opt) {
    let normalizedOpt = opt.replace('_', '-');
    normalizedOpt = `-${normalizedOpt}`;
    return normalizedOpt;
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
  constructOptString(opts) {
    // MAP/forEach
    // push+join array instead of string concat
    let optString = '';

    Object.keys(opts).forEach((option) => {
      if (option === 'var') {
        Object.keys(opts[option]).forEach((v) => {
          optString += ` -var '${v}=${opts[option][v]}'`;
        });
      } else if (typeof opts[option] === 'boolean') {
        if (opts[option]) {
          optString += ` -${option}`;
        }
      } else if (Array.isArray(opts[option])) {
        opts[option].forEach((item) => {
          optString += ` ${Terraform.normalizeArg(option)}=${item}`;
        });
      }
    });

    if (this.noColor) {
      optString += ' -no-color';
    }
    return optString;
  }

  /**
  * Execute a terraform subcommand with its arguments and options
  * @param {String} subCommandString - a subcommand + options string
  * @return {Object} shelljs exec object
  */
  terraform(subCommandString) {
    const command = `terraform ${subCommandString}`;
    const cwd = process.cwd();

    process.chdir(this.workDir);

    const outcome = sh.exec(command, { silent: this.silent });

    process.chdir(cwd);
    return outcome;
  }

  apply(args, dirOrPlan = '') {
    return this.terraform(`apply${this.constructOptString(args)} ${dirOrPlan}`);
  }

  destroy(args, dir = '') {
    return this.terraform(`destroy${this.constructOptString(args)} ${dir}`);
  }

  console(args, dir = '') {
    return this.terraform(`console${this.constructOptString(args)} ${dir}`);
  }

  fmt(args, dir = '') {
    return this.terraform(`fmt${this.constructOptString(args)} ${dir}`);
  }

  get(args, path = process.cwd()) {
    return this.terraform(`get${this.constructOptString(args)} ${path}`);
  }

  graph(args, dir) {
    return this.terraform(`graph${this.constructOptString(args)} ${dir}`);
  }

  import(args, addrId) {
    return this.terraform(`import${this.constructOptString(args)} ${addrId}`);
  }

  init(args, source, path) {
    return this.terraform(`init${this.constructOptString(args)} ${source} ${path}`);
  }

  output(args, name) {
    return this.terraform(`output${this.constructOptString(args)} ${name}`);
  }

  plan(args, dirOrPlan) {
    return this.terraform(`plan${this.constructOptString(args)} ${dirOrPlan}`);
  }

  push(args, dir) {
    return this.terraform(`push${this.constructOptString(args)} ${dir}`);
  }

  refresh(args, dir) {
    return this.terraform(`refresh${this.constructOptString(args)} ${dir}`);
  }

  show(args, path) {
    return this.terraform(`show${this.constructOptString(args)} ${path}`);
  }

  taint(args, name) {
    return this.terraform(`taint${this.constructOptString(args)} ${name}`);
  }

  untaint(args, name) {
    return this.terraform(`untaint${this.constructOptString(args)} ${name}`);
  }

  validate(args, path) {
    return this.terraform(`validate${this.constructOptString(args)} ${path}`);
  }

}

module.exports.Terraform = Terraform;
module.exports.version = version;
