const connection = require('../Config/db');

exports.addEvent = async (req,res) =>{
    let userId = req.body.user_id;
    let startDate = req.body.start_date;
    let endDate = req.body.end_date ? req.body.end_date : null;
    let startTime = req.body.start_time;
    let endTime = req.body.end_time;
    let repeatOn = req.body.repeat_on != undefined ? req.body.repeat_on : '';

    let day1,day2;
    
    if (repeatOn) {
        day1 = repeatOn.split(',')[0];
        day2 = repeatOn.split(',')[1];
    } else {
        day1 = day2 = getDayName(day1);
    }

    try {
        let [row] = await connection.query('select count(*) as userCount from user where id = ?', [req.body.user_id]);
        if (row.pop().userCount === 0) {
            res.status(200).send({ status: 'success', message: 'User Does not exist' });
        } else {

            //check for normal event overlap
            let [rows] = await connection
                .query('select count(*) as eventCount from event_log where user_id = ? and start_date = ? and end_date = ? and start_time >= ? and end_time <= ?',
                    [userId,
                        startDate,
                        endDate,
                        startTime,
                        endTime]);

            let oneTimeEventExist = rows.pop().eventCount > 0;
            //check for recurring event overlap
            [rows] = await connection
                .query('select count(*) as eventCount from event_log where user_id = ? and start_date = ? and end_date is null and start_time >= ? and end_time <= ? and repeat_on like ? or repeat_on like ?',
                    [userId,
                        startDate,
                        startTime,
                        endTime,
                        '%' + day1 + '%',
                        '%' + day2 + '%'
                    ]);

            let recurringEventExist = rows.pop().eventCount > 0;

            if (oneTimeEventExist || recurringEventExist) {
                res.status(200).send({ status: 'error', message: 'An event exists for this time period' });
            } else {
                let [ResultSetHeader] = await connection
                    .query('INSERT INTO event_log (name,type,start_date,end_date,user_id,start_time,end_time,repeat_on) VALUES (?,?,?,?,?,?,?,?)',
                        [req.body.name,
                        req.body.type,
                            startDate,
                            endDate,
                            userId,
                            startTime,
                            endTime,
                            repeatOn
                        ]);
                console.log(ResultSetHeader.insertId);
                res.status(200).send({ status: 'success', message: 'Event Added' });
            }
        }
    }
    catch (e) {
        res.status(500).send({ status: 'error', message: "Something went wrong!!", data: e });
    }

}

exports.getEvents = async (req,res) =>{
    let startDate = req.query.start_date;
    let endDate = req.query.end_date;
    let finalData = [];
    try {
        //get on time events
        let [rows] =
            await connection.query('select * from event_log where type = 1 and user_id = ? and start_date >= ? and end_date <= ?',
                [req.query.user_id, startDate, endDate]);
        finalData = [...rows] ;       
        //get recurring events
        [rows] =
            await connection.query('select * from event_log where type = 2 and user_id = ? and start_date >= ? and end_date is null',
                [req.query.user_id, startDate]);
        finalData.concat(rows);        
        res.status(200).send({ status: 'success', message: '', data: rows });
    } catch (e) {

        console.log(e);
        res.status(500).send({ status: 'error', message: "Something went wrong!!" });
    }
}
