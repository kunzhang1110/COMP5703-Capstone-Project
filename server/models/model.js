import tp from '../models/db';


export const getRoute = function () {
  return tp.sql('SELECT * FROM dbo.route_delay_with_name')
    .execute();
};
