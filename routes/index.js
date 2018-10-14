import express from 'express';
import Battle from '../models/Battle';
const router = express.Router();

router.route('/list')
    .get((req, res) => {
        Battle.distinct('location', {
            'location': {
                $nin: ["", null]
            }
        }).then((result) => {
            res.status(200).send({
                status: true,
                data: result
            });
        }).catch((err) => {
            res.status(500).send({
                status: false,
                message: err.message
            })
        });

    })
router.route('/count')
    .get((req, res) => {
        Battle.count().then((result) => {
            res.status(200).send({
                status: true,
                data: result
            });
        }).catch((err) => {
            res.status(500).send({
                status: false,
                message: err.message
            })
        });
    });

router.route('/stats')
    .get((req, res) => {
        let tempdata = {};
        let finalResult = {};
        Promise.all([
            Battle.aggregate([{
                $project: {
                    _id: 0,
                    attacker_king: 1,
                    defender_king: 1,
                    region: 1,
                    name: 1
                }
            }, {
                $sort: {
                    battle_number: -1
                }
            }, {
                $limit: 1
            }]).then((result) => {
                finalResult['most_active'] = result[0];
                return result[0];
            }),
            Battle.aggregate([{
                $group: {
                    _id: '$attacker_outcome',
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $match: {
                    count: {
                        $gt: 1
                    }
                }
            }]).then((result) => {
                result.forEach((e) => {
                    tempdata[e._id] = e.count
                })
                finalResult['attacker_outcome'] = tempdata;
                return tempdata;
            }),

            Battle.distinct('battle_type', {
                'battle_type': {
                    $nin: ["", null]
                }
            }).then((result) => {
                finalResult['battle_type'] = result;
            }),

            Battle.aggregate([{
                $match: {
                    defender_size: {
                        $nin: ['', null]
                    }
                }
            }, {
                $group: {
                    _id: null,
                    min: {
                        $min: '$defender_size'
                    },
                    max: {
                        $max: '$defender_size'
                    },
                    avg: {
                        $avg: '$defender_size'
                    }
                }
            }, {
                $project: {
                    _id: 0
                }
            }]).then((result) => {
                finalResult['defender_size'] = result[0];
                return result[0];
            }),

        ]).then((result) => {
            res.status(200).send({
                status: true,
                data: finalResult
            });
        }).catch((err) => {
            res.status(500).send({
                status: false,
                message: err.message
            })
        });

    })
router.route('/search')
    .get((req, res) => {
        let andReq = {};
        let orReq = [];
        let tempArr = [];
        Object.keys(req.query).forEach(e => {
            tempArr = Object.keys(Battle.schema.obj).filter(s => s.indexOf(e) !== -1);
            tempArr.forEach(el => {
                if (tempArr.length > 1)
                    orReq.push({
                        [el]: req.query[e]
                    });
                else
                    andReq[el] = req.query[e];
            });
        });
        Battle.find(orReq.length > 0 ? {
            $or: orReq
        } : {}).and(andReq).exec().then((result) => {
            res.status(200).send({
                status: true,
                data: result
            });
        }).catch((err) => {
            res.status(500).send({
                status: false,
                message: err.message
            })
        });

    })

export default router;