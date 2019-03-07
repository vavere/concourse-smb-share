const tap = require('tap');
const {createGet, createPut} = require('../lib/create-cmd');

tap.test('test createGet', function (tap) {

    const cmd = createGet('service', '', '', '', 'tar', '')
    tap.equal(cmd.args.join(' '), 'service -N --grepable --debuglevel=0 -Tc tar *')

    const cmd1 = createGet('service', '', '', '', 'tar', 'file')
    tap.equal(cmd1.args.join(' '), 'service -N --grepable --debuglevel=0 -Tc tar file')

    const cmd2 = createGet('service', '', '', 'dir', 'tar', 'file')
    tap.equal(cmd2.args.join(' '), 'service -N --grepable --debuglevel=0 -D dir -Tc tar file')

    const cmd3 = createGet('service', 'user', '', 'dir', 'tar', 'file')
    tap.equal(cmd3.args.join(' '), 'service -N --user=user --grepable --debuglevel=0 -D dir -Tc tar file')

    const cmd4 = createGet('service', 'user', 'pass', 'dir', 'tar', 'file')
    tap.equal(cmd4.args.join(' '), 'service pass --user=user --grepable --debuglevel=0 -D dir -Tc tar file')

    tap.end();
})

tap.test('test createPut', function (tap) {

    const cmd = createPut('service', '', '', '', 'tar')
    tap.equal(cmd.args.join(' '), 'service -N --grepable --debuglevel=0 -Tx tar')

    const cmd1 = createPut('service', '', '', 'dir', 'tar')
    tap.equal(cmd1.args.join(' '), 'service -N --grepable --debuglevel=0 -D dir -Tx tar')

    const cmd2 = createPut('service', 'user', '', 'dir', 'tar')
    tap.equal(cmd2.args.join(' '), 'service -N --user=user --grepable --debuglevel=0 -D dir -Tx tar')

    const cmd3 = createPut('service', 'user', 'pass', 'dir', 'tar')
    tap.equal(cmd3.args.join(' '), 'service pass --user=user --grepable --debuglevel=0 -D dir -Tx tar')

    tap.end();
})