<?lsp
-- main function as app.process_request() are defined in .preload file

-- trace("request of server.lsp") -- console.log
-- -- DBG
-- trace("Path = "..io:realpath(""))
-- -- display all posted values
-- for name,value in request:datapairs() do
--   trace(name,'=',value)
-- end


if not List_files then
  function List_files()
    local files = {}
    local dir = "./saved_files"
    for name, isdir, mtime, size in io:files("./saved_files", true) do
      if not isdir and name  ~= "Thumbs.db" then
        -- trace("Files = "..name)
        table.insert(files, {name=name, mtime=(mtime*1000), size=(size)} ) -- omitted: isdir
      end
    end

    response:json(files)
  end
end

local action = request:data("action") -- POST and GET data

if action == "process_request" then
  local mode = request:data("mode")

  -- get the body of the request
  local jsonstring = ""

  -- rawrdr() reads in block / chunk
  for data in request:rawrdr() do
    jsonstring = jsonstring .. data
  end
  -- trace("Content-Length and data length:", request:header("Content-Length"), #jsonstring)

  local devices = ba.json.decode(jsonstring)

  local newdata = app.process_request(mode, devices)
  response:json(newdata)


elseif action == "list_files" then
  List_files()

elseif action == "save" then
  -- get the body of the request
  local jsonstring = ""

  for data in request:rawrdr() do
    jsonstring = jsonstring .. data
  end

  local filename = request:data("filename")
  if not filename or filename == "" or filename == ".json" then
    filename = "file_" .. os.time() .. ".json"
  end
  trace("Save file:", filename)
  require"rwfile".file(io, "./saved_files/" .. filename, jsonstring)

  List_files()

else
  trace("Action non recognized:", action)
  response:abort()
end

?>