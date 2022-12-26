import {useNavigate} from 'react-router-dom'
import React, {useEffect, useRef, useState} from 'react'
import {useSnackbar} from 'notistack'
import useWebSocket from 'react-use-websocket'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  FormControl,
  Typography,
  TextField,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  ButtonGroup,
  Box,
  Chip,
} from '@mui/material'
import {restfulApiConfig} from '../../Config'
import Base from '../../components/Base'
import {Hosts, NICs, ImageLists, Storages, VMDetail, InputStorages, InputNICs} from '../../interface'
import {useRecoilState} from 'recoil'
import {HostsState, VMsState} from '../../api/Recoil'

export default function Create() {
  const [hosts, setHosts] = useRecoilState(HostsState)
  const [storages, setStorages] = useState<Storages[]>([])
  const [storageLists, setStorageLists] = useState<ImageLists[]>([])
  const [nics, setNICs] = useState<NICs[]>([])
  const [inputStorages, setInputStorages] = useState<InputStorages[]>([])
  const [inputNICs, setInputNICs] = useState<InputNICs[]>([])
  const navigate = useNavigate()
  const {enqueueSnackbar} = useSnackbar()
  const req: any = {}

  // 1:有効 2:無効
  const {sendMessage, lastMessage, readyState} = useWebSocket(
    restfulApiConfig.wsURL + '/vm',
    {
      onOpen: () =>
        enqueueSnackbar('WebSocket接続確立', {variant: 'success'}),
      onClose: () => enqueueSnackbar('WebSocket切断', {variant: 'error'}),
      shouldReconnect: (closeEvent) => true,
    }
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        type: 9,
      })
    )
  }, [])

  useEffect(() => {
    if (lastMessage == null) {
      return
    }
    console.log(lastMessage)
    const obj = JSON.parse(lastMessage?.data)
    if (obj.error) {
      enqueueSnackbar('Error: ' + obj.error, {variant: 'error'})
      return
    }
    // get templates
    if (obj.type === 8) {
      setStorages(JSON.parse(obj.data.template).storage)
      setStorageLists(JSON.parse(obj.data.image_list))
      console.log('obj.data.image_list', obj.data.image_list)
      setNICs(JSON.parse(obj.data.template).nic)
    }
    // get hosts
    if (obj.type === 9) {
      setHosts(JSON.parse(obj.data.hosts))
    }
    ref.current?.scrollIntoView()
  }, [lastMessage])

  const getTemplate = (hostname: string) => {
    sendMessage(
      JSON.stringify({
        type: 8,
        data: {hostname},
      })
    )
  }

  const addStorage = () => {
    setInputStorages([...inputStorages, {
      name: "",
      image: "",
      size: 0
    }])
  }

  const deleteStorage = (del_index: number) => {
    setInputStorages((prevState) =>
      prevState.filter((_, index) => index !== del_index)
    )
  }

  const addNIC = () => {
    setInputNICs([...inputNICs, {
      name: "",
    }])
  }

  const deleteNIC = (del_index: number) => {
    setInputNICs((prevState) =>
      prevState.filter((_, index) => index !== del_index)
    )
  }

  const create = () => {
    req.is_cloud_init = false
    let req_storages = []
    let req_nics = []
    let count = 0
    for (const inputStorage of inputStorages) {
      const tplStorage = storages.find(storage => storage.name === inputStorage.name)
      if (tplStorage === undefined) {
        return
      }
      let typeNum = 0
      let path = inputStorage.name
      if (tplStorage?.option.is_iso) {
        typeNum = 1
        path = inputStorage.image
      }
      if (count === 0) {
        let boot: string
        switch (typeNum) {
          case 1:
            boot = "cdrom"
            break
          case 2:
            boot = "fd"
            break
          default:
            boot = "hd"
        }
        req.boot = boot
      }

      req_storages.push({
        type: typeNum,
        file_type: 1,
        path: path,
        readonly: false,
        size: inputStorage.size
      })
      count++
    }

    for (const inputNIC of inputNICs) {
      const tplNIC = nics.find(nic => nic.name === inputNIC.name)
      if (tplNIC === undefined) {
        return
      }

      req_nics.push({
        type: 0,
        driver: 0,
        mode: 0,
        mac: "",
        device: tplNIC.interface
      })
    }

    req.disk = req_storages
    req.nic = req_nics
    // test start
    req.memory = 2048
    req.cpu = 2
    req.name = "test"
    req.hostname = "10.100.1.180"
    // test end
    console.log("req", req)

    sendMessage(
      JSON.stringify({
        type: 51,
        data: {hostname: req.hostname},
        vm_input: req
      })
    )
  }

  return (
    <Base>
      <Container component="main" sx={{mt: 10}}>
        <Typography variant="h4" component="h1">
          VM Create
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{minWidth: 275}}>
              <CardContent>
                <FormControl sx={{m: 1, width: '30ch'}}>
                  <InputLabel id="host-label" required>
                    Host
                  </InputLabel>
                  <Select
                    labelId="host-select-label"
                    id="host-select-select"
                    label="Hosts"
                    value={req.hostname}
                    onChange={(event) => {
                      req.hostname = event.target.value
                      getTemplate(event.target.value)
                    }}
                  >
                    {hosts?.map((host: Hosts) => (
                      <MenuItem key={host.host_name} value={host.host_name}>
                        {host.host_name}({host.user})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  required
                  id="name"
                  label="name"
                  multiline
                  sx={{m: 1, width: '25ch'}}
                  rows={1}
                  value={req.name}
                  onChange={(event) => (req.name = event.target.value)}
                  variant="outlined"
                />
                <br/>
                <TextField
                  required
                  id="cpu"
                  label="cpu"
                  type="number"
                  variant="outlined"
                  sx={{m: 1, width: '15ch'}}
                  value={req.cpu}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event) => (req.cpu = event.target.value)}
                />
                <TextField
                  required
                  id="memory"
                  label="memory"
                  type="number"
                  sx={{m: 1, width: '15ch'}}
                  value={req.memory}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">MB</InputAdornment>
                    ),
                  }}
                  onChange={(event) => (req.memory = event.target.value)}
                />
              </CardContent>
              <Card sx={{marginLeft: 2, marginRight: 10}}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    storage
                  </Typography>
                  <br/>
                  {inputStorages?.map((storage: any, index) => (
                    <Box key={'storage_' + index}>
                      <Chip label={index + 1} variant="outlined"/>
                      <FormControl sx={{m: 1, width: '30ch'}}>
                        <InputLabel id="storage-select-label">
                          Storage
                        </InputLabel>
                        <Select
                          labelId="storage-select-label"
                          id="storage-select"
                          value={inputStorages[index].name ?? ''}
                          label="storage"
                          onChange={(event) => {
                            setInputStorages((prevState) => {
                              return prevState.map((oldItem, oldIdx) => {
                                if (oldIdx === index) {
                                  return {
                                    ...oldItem,
                                    name: event.target.value,
                                  }
                                }
                                return oldItem
                              })
                            })
                          }}
                        >
                          {storages?.map((storage: Storages) => (
                            <MenuItem key={storage.name} value={storage.name}>
                              {storage.name}({storage.comment})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {(storages.find(
                          (storage) => storage.name === inputStorages[index].name
                        )?.option.is_iso ||
                        storages.find(
                          (storage) =>
                            storage.name === inputStorages[index].name
                        )?.option.is_cloudimg) && (
                        // inputStorages[index]. ?? ""
                        <FormControl sx={{m: 1, width: '30ch'}}>
                          <InputLabel id="image-list-select-label">
                            Image List
                          </InputLabel>
                          <Select
                            labelId="image-list-select-label"
                            id="image-list-select"
                            value={inputStorages[index].image ?? ''}
                            label="image-list"
                            onChange={(event) => {
                              setInputStorages((prevState) => {
                                return prevState.map((oldItem, oldIdx) => {
                                  if (oldIdx === index) {
                                    return {
                                      ...oldItem,
                                      image: event.target.value,
                                    }
                                  }
                                  return oldItem
                                })
                              })
                            }}
                          >
                            {
                              storageLists
                                .find((storageList) =>
                                  storageList.name === (inputStorages[index].name ?? '')
                                )?.path?.map((storageList, idx) => (
                                <MenuItem key={storageList} value={storageList}>
                                  {storageList}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      )}
                      <TextField
                        required
                        id="size"
                        label="size"
                        type="number"
                        sx={{m: 1, width: '15ch'}}
                        value={inputStorages[index].size ?? 0}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">MB</InputAdornment>
                          ),
                        }}
                        onChange={(event) => {
                          setInputStorages((prevState) => {
                            return prevState.map((oldItem, oldIdx) => {
                              if (oldIdx === index) {
                                return {...oldItem, size: Number(event.target.value)}
                              }
                              return oldItem
                            })
                          })
                        }}
                      />
                      {index !== 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color={'error'}
                          sx={{m: 2}}
                          onClick={() => deleteStorage(index)}
                        >
                          削除
                        </Button>
                      )}
                      <ButtonGroup>
                        {index !== 0 && (
                          <Button
                            size="small"
                            onClick={() => {
                              const newArr = inputStorages.concat()
                              newArr[index] = inputStorages[index - 1]
                              newArr[index - 1] = inputStorages[index]
                              setInputStorages(() => newArr)
                            }}
                          >
                            ↑
                          </Button>
                        )}
                        {inputStorages.length !== 1 &&
                          inputStorages.length !== index + 1 && (
                            <Button
                              size="small"
                              onClick={() => {
                                const newArr = inputStorages.concat()
                                newArr[index + 1] = inputStorages[index]
                                newArr[index] = inputStorages[index + 1]
                                setInputStorages(() => newArr)
                              }}
                            >
                              ↓
                            </Button>
                          )}
                      </ButtonGroup>
                    </Box>
                  ))}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => addStorage()}>
                    追加
                  </Button>
                  <Button
                    size="small"
                    onClick={() => console.log(inputStorages)}
                  >
                    Show
                  </Button>
                </CardActions>
              </Card>
              <br/>
              <Card sx={{marginLeft: 2, marginRight: 10, marginBottom: 1}}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    NIC
                  </Typography>
                  <br/>
                  {inputNICs?.map((storage: any, index) => (
                    <Box key={'nic_' + index}>
                      <Chip label={index + 1} variant="outlined"/>
                      <FormControl sx={{m: 1, width: '30ch'}}>
                        <InputLabel id="nic-select-label">NIC</InputLabel>
                        <Select
                          labelId="nic-select-label"
                          id="nic-select"
                          value={inputNICs[index].name ?? ''}
                          label="nic"
                          onChange={(event) => {
                            setInputNICs((prevState) => {
                              return prevState.map((oldItem, oldIdx) => {
                                if (oldIdx === index) {
                                  return {
                                    ...oldItem,
                                    name: event.target.value,
                                  }
                                }
                                return oldItem
                              })
                            })
                          }}
                        >
                          {nics?.map((nic: NICs) => (
                            <MenuItem key={nic.name} value={nic.name}>
                              {nic.name}({nic.comment})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {index !== 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color={'error'}
                          sx={{m: 2}}
                          onClick={() => deleteNIC(index)}
                        >
                          削除
                        </Button>
                      )}
                      <ButtonGroup>
                        {index !== 0 && (
                          <Button
                            size="small"
                            onClick={() => {
                              const newArr = inputNICs.concat()
                              newArr[index] = inputNICs[index - 1]
                              newArr[index - 1] = inputNICs[index]
                              setInputNICs(() => newArr)
                            }}
                          >
                            ↑
                          </Button>
                        )}
                        {inputNICs.length !== 1 &&
                          inputNICs.length !== index + 1 && (
                            <Button
                              size="small"
                              onClick={() => {
                                const newArr = inputNICs.concat()
                                newArr[index + 1] = inputNICs[index]
                                newArr[index] = inputNICs[index + 1]
                                setInputNICs(() => newArr)
                              }}
                            >
                              ↓
                            </Button>
                          )}
                      </ButtonGroup>
                    </Box>
                  ))}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => addNIC()}>
                    追加
                  </Button>
                </CardActions>
              </Card>
            </Card>
            <br/>
          </Grid>
          <Button size="small" onClick={() => create()}>
            作成
          </Button>
          <Grid item xs={12}>
            {/*<LinearProgress variant="determinate" value={progress}/>*/}
            {/*<br/>*/}
            {/*状況: {message}*/}
          </Grid>
        </Grid>
      </Container>
    </Base>
  )
}
