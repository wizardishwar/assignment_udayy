const connection = require('../Config/db');


exports.checkUserExist = () => {
    let [row] = await connection.query('select count(*) as userCount from user where id = ?', [req.body.user_id]);
    return row.pop().userCount > 0
}