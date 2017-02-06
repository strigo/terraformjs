# Configure the Docker provider
provider "docker" {
    host = "tcp://127.0.0.1:2376/"
}

# Create a container
resource "docker_container" "es" {
    image = "${docker_image.elasticsearch.latest}"
    name = "foo"
}

resource "docker_image" "elasticsearch" {
    name = "elasticsearch:latest"
}