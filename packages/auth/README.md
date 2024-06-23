Awesome Auth
========

Awesome Auth is mainly used by static sites to give users functionalities
like comment, like, validation, etc. It could be used with Awesome Comment,
or alternative with Auth0.

We assume that you, as a static site owner, don't need a complex user system.
The only thing you need is to know who is this current user, and allow them
or disallow them to do something. You don't need to store sensitive data,
just some useful information like game scores to make user more engaged.

So, here are something we will provide:

- Only SSO via Google Identity (other providers will be added soon)
- Serverless / Worker based backend API, only for validation
- No user data stored


Usage
--------

1. Integrate Awesome Auth into your site
    ```js
    import AwesomeAuth from '@roudanio/awesome-auth';
   
    const auth = Auth.init({
      clientId: 'YOUR-GOOGLE-CLIENT-ID'
    });
    ``` 
2. Deploy the backend API
    1. Clone this repo 
    2. Install dependencies
    3. Set up your Cloudflare account, create an worker
    4. Add your Google Client ID and Cloudflare Account ID to the wrangler.toml file
    5. then publish the worker
        ```bash
        wrangler publish
        ```
3. Add your own code for your own features
    ```js
    // in your backend API, maybe some middleware
    import { verifyUser } from '@roudanio/awesome-auth';
   
    const user = await verifyUser(token);
    if (!user) {
      // not valid user, return 401 or something else
      return;
    }
    ```

### Store or retrieve user data

After all setup, you can store or retrieve user data like this:

```js
// store
auth.store(key, value);

// retrieve
auth.retrieve(key);
```

### with Awesome Comment

Of course it's very simple to use Awesome Auth with Awesome Comment:

```js
import { Auth } from '@roudanio/awesome-auth';
   
Auth.init({
  clientId: 'YOUR-GOOGLE-CLIENT-ID'
});

AwesomeComment.init({
  auth: Auth,
});
```


Support SSO
------

- [x] Google Identity
- [ ] GitHub SSO
- [ ] Sign in with Apple 
