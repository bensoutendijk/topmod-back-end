import * as prod from './prod';
import * as dev from './dev';

export default (process.env.NODE_ENV === 'production') ? (
  prod
) : (
  dev
);
