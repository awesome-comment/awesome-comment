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

1. Deploy the backend API
   1. Fork this repo
   2. Deploy `/auth-admin` on Serverless / Self-hosted servers
   3. Set up the environment variables
2. Integrate Awesome Auth into your site
    ```js
    import { getInstance } from '@roudanio/awesome-auth';
   
    const auth = getInstance({
      googleId: 'YOUR-GOOGLE-CLIENT-ID',
      root: 'https://your-backend-api.com',
    });
    // register events to handle user state
    awesomeAuth.on(AwesomeAuthEvent.VERIFIED, handleVerified);
    awesomeAuth.on(AwesomeAuthEvent.VERIFYING, handleUnverified);
    ``` 
3. Add your own code for your own features
    ```js
    // in your frontend code, attach access token to requests
    const token = auth.accessToken;
    fetch('https://your-backend-api.com/your-endpoint', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
   
    // in your backend API, validate the token by JWT.verify or with http request   
    const token = getHeader('Authorization');
    const user = jwt.verify(token, process.env.JWT_SECRET);
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
import { getInstance } from '@roudanio/awesome-auth';
   
const auth = getInstance({
  googleId: 'YOUR-GOOGLE-CLIENT-ID',
  root: 'https://your-backend-api.com',
});

AwesomeComment.init({
  awesomeAuth: auth,
  // other options
});
```


Support SSO
------

- [x] Google Identity
- [ ] GitHub SSO
- [ ] Sign in with Apple 


LICENSE
------

[MIT](./LICENSE.md)
```
