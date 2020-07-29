let cron = require('node-cron');

cron.schedule('5 23 * * *', () => {
    console.log('running a task at 11:05s');
    
});

cron.schedule('45 23 * * *', () => {
    console.log('running a task at 11:45');

});
