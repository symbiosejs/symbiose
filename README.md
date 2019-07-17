# Symbiose
Symbiose is Node.js framework, it is a layer to combine wisely Symfony's way with Node, we use popular packages to keep this project maintenable.

Popular dependencies:

 - **HTTP Server & Router:** [Express 4][express] because no need to reinvent the wheel.
 - **Template engine recommanded:** [Nunjucks][nunjucks] of Mozilla because this engine is similar to Twig. You can change with another [template engine][express_doc_template_engine].

[express]: https://expressjs.com/
[nunjucks]: https://github.com/mozilla/nunjucks

## Why use Symbiose?

Symbiose lets you make a project without dependencies asking, we integrate all you need for MVC framework. Make a folder structured with Symbionts (= packages) let you fast reuse the Symbiont for another project.

### PRO:

<!--
 1. Alone Express is not usable for a medium or big project because Express need dependencies to work well. Symbiose integrating dependencies that you need ;
 2. Standard for structured code project ;
 3. Packages (symbionts) are easily reusable in another project ;
 4. Symbiose is framework which uses popular dependencies like [Express][express], Express' dependencies, your favorite [template engine][express_doc_template_engine], YAML...
 5. As long as Express is maintened, this package is easily maintainable.
 6. You can easily choose your favorite template or css engine without configuration.
-->


[express_doc_template_engine]: https://expressjs.com/en/resources/template-engines.html

## What does Symbiose do?

In [Why use Symbiose?](#why-use-symbiose), we say

## Installation

> **WARNING:** Beta / In developpement  
> The automatic project folder making is not ready.

```
npm install symbiose
```


### New project:

Create your new project by running:

```
/npm explore symbiose-generator -- npm run init-project --viewengine=
```


### Install template engine:

```
npm explore symbiose-generator -- npm run install-template-engine
```
