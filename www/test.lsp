<?lsp

-- page for manual test

local ip = '192.168.1.72'
local port = 502
local uid = 11
local timeout = 2000 -- millisecond, default 3 s
local addr = 1658

local res

local mb, err_conn -- The Modbus instance
local transaction, err_transaction -- last sent transaction number


local function mycallback(data_mb, err_mb, _transaction, _mb)
    -- called only if asynch=true
    -- so, in this file, this function is IGNORED
    trace('hello mycallback', data_mb, err_mb, transaction, _transaction, mb, _mb)

    assert(transaction == _transaction) -- integrity check
    assert(mb == _mb) -- Integrity check

    if data_mb then
        -- data is a table with boolean values
        trace("Data:", data_mb[1])
    else
        trace("Failed, error code:", err_mb)
    end
    mb:close() -- Close connection
    trace('done mycallback')
end


local mbmodule = require "modbus.client"

local async = false

trace("server2 Connecting: ", ip, port, uid, "timeout (s):", timeout*0.001 )

mb, err_conn = mbmodule.connect(ip, {async=async, port=port, uid=uid, timeout=timeout})

if err_conn then
    trace ("connection error:", err_conn)
    res = err_conn
end

if mb then
    trace("connected")
    transaction, err_transaction = mb:rholding(addr, 1, 'word')  --, mycallback)
    if transaction then
        trace('done async', async, transaction)
        res = transaction[1]
    else
        trace('fail async', async, err_transaction)
        res = err_transaction
    end
end

response:write(res)

mb:close()

?>