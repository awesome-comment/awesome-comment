export default defineEventHandler(function (event) {
  setHeader(event, 'WWW-authenticate', 'Basic realm="Awesome Comment"');
  setResponseStatus(event, 401);
  return 'Auth Required';
});
