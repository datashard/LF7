export default {
    SELECT: {
        DEVICE: (id: string) => `select * from devices where id='${id}';`,
        DEVICENAME: (id: string) => `select deviceName from devices where id='${id}';`,
        DEVICES_SETTINGS: () => `select id, (select deviceName from devices where id=device) as deviceName, device as deviceID, JSON_EXTRACT(jsonData, '$.interval') as postInterval, JSON_EXTRACT(jsonData, '$.alertLevel') as alertLevel from settings;`,
        SETTINGS: (id: string) => `select * from settings where device='${id}';`,
        LAST50: () => `select id, waterlevel, insert_date as date, (select deviceName from devices where id=device) as device, device as deviceID, (select JSON_EXTRACT(jsonData, '$.interval') from settings where device=deviceID) as postInterval from waterlevel order by insert_date desc limit 50;`,
        ALERTLEVELS: () => `select jsonData->'$.alertLevel' as alertLevel, device from settings`,
    },
    INSERT: {
        DEVICES: (name: string, id: string) => `insert into devices(deviceName, id) values ('${name}', '${id}');`,
        SETTINGS: (id: string) => `insert into settings(device, jsonData) values ('${id}', '${JSON.stringify({ interval: 10 * 1000, alertLevel: 300 })}');`,
        LEVEL: (id: string, level: number) => `insert into waterlevel(device, waterlevel) values ('${id}', '${level}');`
    },
    UPDATE: {
        UPDATE_DEVICENAME: (id: string, name: string) => `UPDATE devices SET deviceName = '${name}' WHERE id='${id}';`,
        SETTING: (id: string, setting: string, value: number | string) => `UPDATE settings SET jsonData = JSON_SET(jsonData, '$.${setting}', ${value}) WHERE device='${id}';`,
        ALL_SETTINGS: (id: string, settings: any) => `UPDATE settings SET jsonData = '${JSON.stringify(settings)}' WHERE device='${id}';`
    }
}
