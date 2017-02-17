const sh = require('shelljs');


/**
 * Retrieve a stripped version of terraform's executable version.
 * e.g. (Terraform v0.8.5 => 0.8.5)
 * @returns {String} A stripped string representing the version
 */
const version = function showVersion() {
  const outcome = sh.exec('terraform --version', { silent: true });
  const parsedVersion = outcome.stdout.split('\n')[0].split(' ')[1].substr(1);
  return parsedVersion;
};

/**
 * Terraform API Class
 */
class Terraform {
  /**
   * Execute terraform commands
   * @todo: Implement `remote`, `debug` and `state` support (which require subcommands)
   * @todo: Assert that terraform exists before allowing to perform actions
   * @todo: once finalized, document each command
   * @param {String} workDir (default: cwd)
   * @param {Boolean} silent (default: false)
   * @param {Boolean} noColor (default: false)
   */
  constructor(workDir = process.cwd(), silent = false, noColor = false) {
    this.workDir = workDir;
    this.silent = silent;
    this.noColor = noColor;
  }

  /**
   * Normalize an option.
   * e.g. Converts `vars_file` to `-vars-file`.
   * @param {String} opt string to normalize
   * @returns {String} A normalized option
   */
  static _normalizeArg(opt) {
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
  * @return {String} a string of CLI options
  */
  _constructOptString(opts) {
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
          optString += ` ${Terraform._normalizeArg(option)}=${item}`;
        });
      } else {
        optString += ` ${Terraform._normalizeArg(option)}=${opts[option]}`;
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

  /**
   * Execute `terraform apply`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dirOrPlan Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  apply(args = {}, dirOrPlan = '') {
    return this.terraform(`apply${this._constructOptString(args)} ${dirOrPlan}`);
  }

  /**
   * Execute `terraform destroy`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  destroy(args = {}, dir = '') {
    return this.terraform(`destroy${this._constructOptString(args)} ${dir}`);
  }

  /**
   * Execute `terraform console`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  console(args = {}, dir = '') {
    return this.terraform(`console${this._constructOptString(args)} ${dir}`);
  }

  /**
   * Execute `terraform fmt`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  fmt(args = {}, dir = '') {
    return this.terraform(`fmt${this._constructOptString(args)} ${dir}`);
  }

  /**
   * Execute `terraform get`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} path      Path to install modules for
   * @return {Object}           shelljs execution outcome
   */
  get(args = {}, path = process.cwd()) {
    return this.terraform(`get${this._constructOptString(args)} ${path}`);
  }

  /**
   * Execute `terraform graph`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  graph(args = {}, dir = '') {
    return this.terraform(`graph${this._constructOptString(args)} ${dir}`);
  }

  /**
   * Execute `terraform import`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} addr      Address to import the resource to
   * @param  {String} id        resource-specific ID to identify that resource being imported
   * @return {Object}           shelljs execution outcome
   */
  import(args = {}, addr, id) {
    return this.terraform(`import${this._constructOptString(args)} ${addr} ${id}`);
  }

  /**
   * Execute `terraform init`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} source    Source to download from
   * @param  {String} path      Path to download to
   * @return {Object}           shelljs execution outcome
   */
  init(args = {}, source, path = process.cwd()) {
    return this.terraform(`init${this._constructOptString(args)} ${source} ${path}`);
  }

  /**
   * Execute `terraform output`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} name      Name of resource to display outputs for (defaults to all)
   * @return {Object}           shelljs execution outcome
   */
  output(args = {}, name) {
    return this.terraform(`output${this._constructOptString(args)} ${name}`);
  }

  /**
   * Execute `terraform plan`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dirOrPlan Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  plan(args = {}, dirOrPlan) {
    return this.terraform(`plan${this._constructOptString(args)} ${dirOrPlan}`);
  }

  /**
   * Execute `terraform push`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  push(args = {}, dir = '') {
    return this.terraform(`push${this._constructOptString(args)} ${dir}`);
  }

  /**
   * Execute `terraform refresh`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  refresh(args = {}, dir = '') {
    return this.terraform(`refresh${this._constructOptString(args)} ${dir}`);
  }

  /**
   * Execute `terraform show`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} path      Path of state file (defaults to local state file)
   * @return {Object}           shelljs execution outcome
   */
  show(args = {}, path) {
    return this.terraform(`show${this._constructOptString(args)} ${path}`);
  }

  /**
   * Execute `terraform taint`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} name      Name of resource to taint
   * @return {Object}           shelljs execution outcome
   */
  taint(args = {}, name) {
    return this.terraform(`taint${this._constructOptString(args)} ${name}`);
  }

  /**
   * Execute `terraform untaint`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} name      Name of resource to untaint
   * @return {Object}           shelljs execution outcome
   */
  untaint(args = {}, name) {
    return this.terraform(`untaint${this._constructOptString(args)} ${name}`);
  }

  /**
   * Execute `terraform validate`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} path      Path to validate terraform files in (defaults to current)
   * @return {Object}           shelljs execution outcome
   */
  validate(args = {}, path) {
    return this.terraform(`validate${this._constructOptString(args)} ${path}`);
  }
}

module.exports.Terraform = Terraform;
module.exports.version = version;
