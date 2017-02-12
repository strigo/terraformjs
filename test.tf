# Set the variable value in *.tfvars file
# or using -var="do_token=..." CLI option
variable "do_token" {}

# Configure the DigitalOcean Provider
provider "digitalocean" {
    token = "${var.do_token}"
}

# Create a web server
resource "digitalocean_droplet" "web" {
    image = "ubuntu-14-04-x64"
    name = "web-1"
    region = "nyc2"
    size = "1024mb"
}