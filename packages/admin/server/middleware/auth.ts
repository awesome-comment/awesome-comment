export default defineEventHandler(async function (event) {
  // not visit admin
  const url = getRequestURL(event);
  if (!url.pathname.startsWith('/admin')) {
    return;
  }

  event.context.auth = await checkUserPermission(event);
});
