Awesome Comment
=====

Usage
-----

1. Add script to your page
    ```html
   <script async src="https://unpkg.com/@meathill/awesome-comment@latest/dist/awesome-comment.js"></script>
    ``` 
2. Attach awesome comment to your page
    ```javascript
    new AwesomeComment('#comment', {
      // your options
    });
    ```


Structure
--------

- packages/awesome-comment
    - Vue3 SPA
    - to be built into dist script
    - to be injected into page, attach comment component to page when running
- packages/admin
    - Nuxt3 
    - admin panel, administrators use it to manage comments
    - to be deployed on Vercel
- packages/core
    - pure TypeScript
    - include type definitions and interfaces
    - and some common functions

Author
--------

* [Meathill](https://blog.meathill.com)


LICENSE
--------

[MIT](https://opensource.org/license/mit/)
