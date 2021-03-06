---
layout: single
permalink: /blog/2019/08/30/docker-aem-bundle
title:  "Docker AEM Bundle"
date:   2019-08-30 23:37:00:00 +1100
author: max@aem.design
categories:
  - blog
tags:
  - devops
  - aem
  - docker
  - automation
---

Building on the previous work [Docker Containers Everywhere](/blog/2019/07/01/docker-containers-everywhere) we have added a new AEM 6.5 Bundle image.

Following is the package map to docker tag relationship, Docker tags conventions is ```{verison}-{bundle type}```, `bundle-forms` includes all packages that are in `bundle`.

| File | Bundle Type |
| ---  | ---    |
| AEM Service Pack | bundle |
| AEM Forms | bundle-forms |
| AEM Backward Compatibility package | bundle |
| ACS Commons Twitter package | bundle |
| ACS Commons Content | bundle |
| ACS Commons All | bundle |
| Netcentric ACL Tools | bundle |
| Netcentric ACL Tools Oak Index | bundle |
| Adobe Vanity URL Servlet | bundle |
| AEM.Design Core | bundle |
| AEM.Design Showcase | bundle |
| Brightcove Integration | bundle |
| Adobe XML Document Services | bundle |

All packages are aimed at to be the latest version. If you need to know exact versions of a package, please refer to the pipeline for the version of the container you are using, example for AEM 6.5.3.0 Bundle with Forms [https://github.com/aem-design/docker-aem/blob/6.5.3.0-bundle-forms/.github/workflows/build.yml](https://github.com/aem-design/docker-aem/blob/6.5.3.0-bundle-forms/.github/workflows/build.yml)

### Existing Run Modes

Its recommended to use [run-modes](https://docs.adobe.com/content/help/en/experience-manager-64/deploying/configuring/configure-runmodes.html) to specify different configurations for different target. [AEM.Design Support](https://github.com/aem-design/aemdesign-aem-support) project has a sub-module [aemdesign-aem-config](https://github.com/aem-design/aemdesign-aem-support/tree/master/aemdesign-aem-config) that contains reference configs for particular run-modes. Following is the definition of all run-modes, this should be expanded in your tenant codebase when you [generate it for your project using archetype](/manifesto/project/#project-archetype).

| Run Mode | Description |
|----------|--------------|
| config | default config for all instances |
| config.author | author instance with specific author configs |
| config.author.forms | author instance with Adobe Forms configs |
| config.author.localdev | author instance for local development |
| config.ldap | ldap config for all instances |
| config.publish | publish instance with specific author configs |
| config.publish.forms | publish instance with Adobe Forms configs |
| config.publish.localdev| publish on local development |

If you would like to provide environment specific configurations our recommendation would be to create individual repos for each configuration set, this will ensure that you do not mix prod and dev configs in one repo.

### Running AEM in Docker

To start local author AEM 6.5 instance with SP3 instance on port 4502 with Bundled Packages run the following.

```bash
docker run --name author \
-e "TZ=Australia/Sydney" \
-e "AEM_RUNMODE=-Dsling.run.modes=author,crx3,crx3tar,forms,localdev" \
-e "AEM_JVM_OPTS=-server -Xms248m -Xmx1524m -XX:MaxDirectMemorySize=256M -XX:+CMSClassUnloadingEnabled -Djava.awt.headless=true -Dorg.apache.felix.http.host=0.0.0.0 -Xdebug -Xrunjdwp:transport=dt_socket,server=y,address=58242,suspend=n" \
-p4502:8080 \
-p30303:58242 -d \
aemdesign/aem:6.5.3.0-bundle-forms
```

Starting local publish AEM 6.5 instance with SP3 on port 4503 is a matter of updating a run mode to `publish` and updating ports for accessing the service, and you should get the following.

```bash
docker run --name publish \
-e "TZ=Australia/Sydney" \
-e "AEM_RUNMODE=-Dsling.run.modes=publish,crx3,crx3tar,forms,localdev" \
-e "AEM_JVM_OPTS=-server -Xms248m -Xmx1524m -XX:MaxDirectMemorySize=256M -XX:+CMSClassUnloadingEnabled -Djava.awt.headless=true -Dorg.apache.felix.http.host=0.0.0.0 -Xdebug -Xrunjdwp:transport=dt_socket,server=y,address=58242,suspend=n" \
-p4503:8080 \
-p30304:58242 -d \
aemdesign/aem:6.5.3.0-bundle-forms
```

If you would like to start AEM Bundle version on different port to say run it along existing aem instance all you need to do is change name of your container and its ports like this:

```bash
docker run --name author65bundle \
-e "TZ=Australia/Sydney" \
-e "AEM_RUNMODE=-Dsling.run.modes=author,crx3,crx3tar,forms,localdev" \
-e "AEM_JVM_OPTS=-server -Xms248m -Xmx1524m -XX:MaxDirectMemorySize=256M -XX:+CMSClassUnloadingEnabled -Djava.awt.headless=true -Dorg.apache.felix.http.host=0.0.0.0 -Xdebug -Xrunjdwp:transport=dt_socket,server=y,address=58242,suspend=n" \
-p4565:8080 \
-p30365:58242 -d \
aemdesign/aem:6.5.3.0-bundle-forms
```

To start local demo AEM 6.4 instance on port 4502 with Bundled Packages run the following:

```bash
docker run --name author64 \
-e "TZ=Australia/Sydney" \
-e "AEM_RUNMODE=-Dsling.run.modes=author,crx3,crx3tar,forms,localdev" \
-e "AEM_JVM_OPTS=-server -Xms248m -Xmx1524m -XX:MaxDirectMemorySize=256M -XX:+CMSClassUnloadingEnabled -Djava.awt.headless=true -Dorg.apache.felix.http.host=0.0.0.0 -Xdebug -Xrunjdwp:transport=dt_socket,server=y,address=58242,suspend=n" \
-p4502:8080 \
-p30303:58242 -d \
aemdesign/aem:6.4.0-bundle-forms
```

If you want to run a base AEM 6.4instance with Service Pack 8 on port 4502 run the following:

```bash
docker run --name author648 \
-e "TZ=Australia/Sydney" \
-e "AEM_RUNMODE=-Dsling.run.modes=author,crx3,crx3tar,forms,localdev" \
-e "AEM_JVM_OPTS=-server -Xms248m -Xmx1524m -XX:MaxDirectMemorySize=256M -XX:+CMSClassUnloadingEnabled -Djava.awt.headless=true -Dorg.apache.felix.http.host=0.0.0.0 -Xdebug -Xrunjdwp:transport=dt_socket,server=y,address=58242,suspend=n" \
-p4502:8080 \
-p30303:58242 -d \
aemdesign/aem:6.4.8.0
```

You can checkout all of the available versions of AEM containers in [Docker AEM](https://github.com/aem-design/docker-aem/branches/all) Github repo.

### License

You will need a license to activate the instance once it ready as it will prompt you to input your details on License splash screen before you can continue:

![AEM License Page](/assets/images/license/license-page.png)

The confirmation screen will show you what version of AEM you are running.

![AEM License Page](/assets/images/license/license-confirm.png)

Additionally, once you log in, you can visit the [Product Info](http://localhost:4502/system/console/productinfo) console to see AEM version. Your version number will be made up of major AEM version and Service Pack Version. For example, if you choose AEM 6.5 with Service Pack 1 its version will be `6.5.1.0`.

### Packages

You will notice that your bundle container will come with the latest SP installed and other packages. Each bundle image tag has a corresponding branch in GitHub you can check the [.travis.yml](https://github.com/aem-design/aem/blob/6.5.0-bundle/.travis.yml) file to see which packages are pre-installed.

### Thank you

Please checkout the docker hub [aemdesign/aem](https://hub.docker.com/r/aemdesign/aem) for further details.

If you would like to contribute or fork the code, you can get it on GitHub [https://github.com/aem-design/aem](https://github.com/aem-design/aem).

Bundle version comes with following [AEM.Design](https://github.com/aem-design) projects:

- [aemdesign-aem-core](https://github.com/aem-design/aemdesign-aem-core) that contains all of the components code
- [aemdesign-aem-support](https://github.com/aem-design/aemdesign-aem-support) that contains all of the supporting content, front-end code and component showcase.
