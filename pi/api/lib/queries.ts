export default {
    SELECT: {
        DEVICES: (id: string) => `select * from devices where id='${id}';`,
        SETTINGS: (id: string) => `select * from settings where device='${id}';`
    },
    INSERT: {
        DEVICES: (name: string, id: string) => `insert into devices(deviceName, id) values ('${name}', '${id}');`,
        SETTINGS: (id: string) => `insert into settings(device, jsonData) values ('${id}', '${JSON.stringify({ interval: 60 * 1000, alertLevel: 300 })}');`,
        LEVEL: (id: string, level: number) => `insert into waterlevel(device, waterlevel) values ('${id}', '${level}');`
    },
    UPDATE: {
        SETTING: (id: string, setting: string, value: number | string) => `UPDATE settings SET jsonData = JSON_SET(jsonData, '$.${setting}', ${value}) WHERE device='${id}';`,
        ALL_SETTINGS: (id: string, settings: any) => `UPDATE settings SET jsonData = '${JSON.stringify(settings)}' WHERE device='${id}';`
    }
}
