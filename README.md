# grunt-cache-invalidate

> Invalidating cache by appending hash in file name

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cache-invalidate --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cache-invalidate');
```

## The "cache_invalidate" task

### Overview
In your project's Gruntfile, add a section named `cache_invalidate` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cache_invalidate: {
    your_target: {
      src: ['sample.html', ...],
      dest: 'build'
    }
  },
});
```

### Options

NULL

### Usage Examples


```js
grunt.initConfig({
  cache_invalidate: {
    your_target: {
      src: ['sample.html', ...],
      dest: 'build'
    }
  },
});
```

## Release History

2014.06.19 - v0.01.0
