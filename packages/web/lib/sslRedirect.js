/* eslint-disable no-param-reassign */
/**
 * Force load with https on production environment
 * https://devcenter.heroku.com/articles/http-routing#heroku-headers
 *
 * Based on https://www.npmjs.com/package/heroku-ssl-redirect
 */
module.exports = ({ port, status }) => {
  status = status || 302;
  return (req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      res.redirect(
        status,
        `https://${req.hostname}${port ? `:${port}` : ""}${req.originalUrl}`
      );
    } else {
      next();
    }
  };
};
