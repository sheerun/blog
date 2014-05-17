---
layout: post
title: Remote access to Docker with TLS
---

By default Docker is only available though UNIX socket. It works if you use it locally. For remote access, you generally had 3 options:

1. [Hack nginx to forward traffic to Docker](http://blog.james-carr.org/2013/10/30/securing-dockers-remote-api/)
2. [Use SSH and socat to tunnel connection](http://blog.james-carr.org/2013/10/30/securing-dockers-remote-api/)
3. [Make Docker daemon listen on exposed port](http://stackoverflow.com/questions/18038985/how-to-connect-to-docker-api-from-another-machine)

First solution is really cumbersome to setup. Second requires socat installed on both server and client. This is not secure and anyone can connect or intercept Docker traffic as connection is not encrypted.

The situation were hopeless until [Docker implemented TLS auth in 0.10](http://blog.docker.io/2014/04/docker-0-10-quality-and-ops-tooling/).

Here are 3 easy steps to setup it:

## I. Generate your certificates

You need to generate 3 kinds of certificates:

* CA certificate is used to generate client and server certs
* Client certificate is used by remote Docker client
* Server certificate is used by Docker daemon on server

I wrote a little Ruby script that generates all three certificates for you. All you need to do is [clone this repository](https://gist.github.com/sheerun/7fe6ac9cecf8d08e8d52) and run following commands:

```bash
$ gem install certificate_authority
$ ruby certgen.rb example.com
CA certificates are in ~/.docker/ca
Client certificates are in ~/.docker
Server certificates are in ~/.docker/example.com
```

Certificates should be now available under `~/.docker` path.

## II. Copy server certificates to remote location

The script generated keys and certificates neede by Docker daemon `~/.docker/example.com` (example.com is your domain name).

Copy them on your server to `~/.docker` directory:

```bash
rsync -ave ssh ~/.docker/example.com/ root@example.com:~/.docker/
```

## III. Configure Docker on remote location

Docker daemon since version 0.10 supports `--tlsverify` mode that enforces encrypted and authenticated remote connections.

I assume you're using Ubuntu 12.04 LTS with Docker already installed and running. Instructions for other distros may be little different.

All you need to do is add following line to `/etc/default/docker`:

```bash
DOCKER_OPTS="--tlsverify -H=unix:///var/run/docker.sock -H=0.0.0.0:4243 --tlscacert=/root/.docker/ca.pem --tlscert=/root/.docker/cert.pem --tlskey=/root/.docker/key.pem"
```

And restart Docker daemon with:

```bash
service docker restart
```

If something went wrong Docker daemon won't start again. You can debug it by browsing logs under `/var/log/upstart/docker.log`.

## That's it!

You can connect to remote Docker instance using `--tlsverify` flag:

```
docker --tlsverify -H tcp://example.com:4243 images
```

It will use certificates stored in  `~/.docker`. To use different ones, you can use `--tls*` options listed in `docker --help` and [documentation](http://docs.docker.io/reference/commandline/cli/).


The official guide of TLS setup [can be found on Docker site](http://docs.docker.io/examples/https/).
