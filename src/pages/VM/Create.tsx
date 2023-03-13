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
  FormGroup,
  Checkbox,
  FormControlLabel,
  FormLabel,
  ListItem,
  Stack,
  LinearProgress,
  LinearProgressProps,
  AlertTitle,
  Alert,
} from '@mui/material'
import {restfulApiConfig} from '../../Config'
import Base from '../../components/Base'
import {
  Hosts,
  TemplateNIC,
  TemplateList,
  TemplateStorage,
  InputStorage,
  InputNIC,
  InputCloudinitUser, CreateVM, TemplateImage, InputCloutinit, Result
} from '../../interface'
import {useRecoilState} from 'recoil'
import {HostsState} from '../../api/Recoil'
import {getArchID} from "../../api/Tool";
import {CreateCloudinitRequest, CreateRequest} from "../../api/Create";

export default function Create() {
  const [hosts, setHosts] = useRecoilState(HostsState)
  const [host, setHost] = useState<string>("")
  const [template, setTemplate] = useState<{ storages: TemplateStorage[], list: TemplateList[], nics: TemplateNIC[], images: TemplateImage[] }>()
  const [req, setReq] = useState<CreateVM>({name: "", cpu: 0, memory: 0, is_cloudinit: false})
  const [result, setResult] = useState<Result>({created_at: "", type: 0, uuid: ""})

  // input
  const [inputPackage, setInputPackage] = useState<string>('')
  const [inputSudo, setInputSudo] = useState<string>('')
  const [inputSSHAuthorizedKeys, setInputSSHAuthorizedKeys] = useState<string>('')
  const [inputDNS, setInputDNS] = useState<string>('')

  const navigate = useNavigate()
  const {enqueueSnackbar} = useSnackbar()

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
    console.log("lastMessage", lastMessage)
    const obj = JSON.parse(lastMessage?.data)
    console.log("lastMessage(obj)", obj)
    if (obj.type === 51 && obj.error) {
      setResult(obj)
      enqueueSnackbar('Error: ' + obj.error, {variant: 'error'})
      return
    }
    if (obj.type !== 51 && obj.error) {
      enqueueSnackbar('Error: ' + obj.error, {variant: 'error'})
      return
    }
    // get templates
    if (obj.type === 8) {
      setTemplate({
        ...template,
        storages: JSON.parse(obj.data.template).storage,
        list: JSON.parse(obj.data.image_list),
        images: JSON.parse(obj.data.template).image_template,
        nics: JSON.parse(obj.data.template).nic
      })
      console.log('obj.data.image_list', obj.data.image_list)
    }
    // get hosts
    if (obj.type === 9) {
      setHosts(JSON.parse(obj.data.hosts))
    }
    // get data
    if (obj.type === 51) {
      setResult(obj)
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

  const addCloudinitUser = () => {
    let users = req.cloudinit?.userdata?.users ?? []
    users.push({
      name: "",
      password: "",
      password_verify: "",
      sudo: ["ALL=(ALL) NOPASSWD:ALL"],
    })
    setReq({
      ...req,
      cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {users: users}
      }
    })
  }

  const deleteCloudinitUser = (del_index: number) => {
    setReq({
      ...req,
      cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {users: req.cloudinit?.userdata?.users?.filter((_, index) => index !== del_index)}
      }
    })
  }

  const addCloudinitPackage = (data: string) => {
    let packages = req.cloudinit?.userdata?.packages ?? []
    packages.push(data)
    setReq({
      ...req, cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {packages: packages}
      }
    })
  }

  const deleteCloudinitPackage = (del_index: number) => {
    let packages = req.cloudinit?.userdata?.packages
    if ((packages?.length ?? 0) === 1) {
      packages = undefined
    } else {
      packages = packages?.filter((_, index) => index !== del_index)
    }
    setReq({
      ...req, cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {packages: packages}
      }
    })
  }

  const addCloudinitSudo = (data: string, index: number) => {
    let users = req.cloudinit?.userdata?.users
    if (users === undefined) {
      return
    }
    let sudo = users[index].sudo ?? []
    sudo.push(data)
    users[index].sudo = sudo
    setReq({
      ...req, cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {users}
      }
    })
  }

  const deleteCloudinitSudo = (user_index: number, del_index: number) => {
    let users = req.cloudinit?.userdata?.users
    if (users === undefined) {
      return
    }
    if ((users[user_index].sudo?.length ?? 0) === 1) {
      users[user_index].sudo = undefined
    } else {
      users[user_index].sudo = users[user_index].sudo?.filter((_, index) => index !== del_index)
    }
    setReq({
      ...req, cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {users}
      }
    })
  }

  const addCloudinitSSHAuthorizedKeys = (data: string, index: number) => {
    let users = req.cloudinit?.userdata?.users
    if (users === undefined) {
      return
    }
    let ssh_authorized_keys = users[index].ssh_authorized_keys ?? []
    ssh_authorized_keys.push(data)
    users[index].ssh_authorized_keys = ssh_authorized_keys
    setReq({
      ...req, cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {users}
      }
    })
  }

  const deleteCloudinitSSHAuthorizedKeys = (user_index: number, del_index: number) => {
    let users = req.cloudinit?.userdata?.users
    if (users === undefined) {
      return
    }
    if ((users[user_index].ssh_authorized_keys?.length ?? 0) === 1) {
      users[user_index].ssh_authorized_keys = undefined
    } else {
      users[user_index].ssh_authorized_keys = users[user_index].ssh_authorized_keys?.filter((_, index) => index !== del_index)
    }
    setReq({
      ...req, cloudinit: {
        ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
        userdata: {users}
      }
    })
  }

  const addStorage = () => {
    let disks = req.disk ?? []
    disks.push({path: "", image: "", size: 0})
    setReq({...req, disk: disks})
  }

  const deleteStorage = (del_index: number) => {
    setReq({...req, disk: req.disk?.filter((_, index) => index !== del_index)})
  }

  const addNIC = () => {
    let nics = req.nic ?? []
    nics.push({device: ""})
    setReq({...req, nic: nics})
  }

  const deleteNIC = (del_index: number) => {
    setReq({...req, nic: req.nic?.filter((_, index) => index !== del_index)})
  }

  const addCloudinitDNS = (data: string, index: number) => {
    let nics = req.nic?.concat() ?? []
    let dns = nics[index].cloudinit?.dns ?? []
    dns.push(data)
    nics[index] = {
      ...nics[index] ?? {name: ""},
      cloudinit: {
        ...nics[index].cloudinit ?? {name: "", address: "", gateway: "", netmask: ""},
        dns: dns
      }
    }
    setReq({...req, nic: nics})
  }

  const deleteCloudinitDNS = (nic_index: number, del_index: number) => {
    let nics = req.nic?.concat() ?? []
    nics[nic_index] = {
      ...nics[nic_index] ?? {name: ""},
      cloudinit: {
        ...nics[nic_index].cloudinit ?? {name: "", address: "", gateway: "", netmask: ""},
        dns: nics[nic_index].cloudinit?.dns?.filter((_, index) => index !== del_index)
      }
    }

    setReq({...req, nic: nics})
  }

  const create = () => {
    if (req.is_cloudinit) {
      try {
        CreateCloudinitRequest(req, template)
      } catch (e: unknown) {
        console.log(e)
        return
      }
    } else {
      try {
        CreateRequest(req, template)
      } catch (e: unknown) {
        console.log(e)
        return
      }
    }

    // test end
    console.log("req", req)

    sendMessage(
      JSON.stringify({
        type: 51,
        data: {hostname: host},
        vm_input: req
      })
    )
  }

  function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Box sx={{width: '100%', mr: 1}}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{minWidth: 35}}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
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
                    defaultValue={""}
                    value={host}
                    onChange={(event) => {
                      setHost(event.target.value)
                      getTemplate(event.target.value)
                    }}
                  >
                    {
                      hosts?.map((host: Hosts) => (
                        <MenuItem key={host.host_name} value={host.host_name}>
                          {host.host_name}({host.user})
                        </MenuItem>
                      ))
                    }
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
                  onChange={(event) => setReq({...req, name: event.target.value})}
                  variant="outlined"
                />
                <br/>
                {
                  !req.is_cloudinit &&
                  <Box>
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
                      onChange={(event) => setReq({...req, cpu: Number(event.target.value)})}
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
                      onChange={(event) => setReq({...req, memory: Number(event.target.value)})}
                    />
                  </Box>
                }
              </CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox checked={req.is_cloudinit} name="is_cloudinit"
                              onChange={(event) => {
                                let cloudinit: InputCloutinit | undefined = {
                                  image_copy: "", name: "", id: "", userdata: undefined
                                }
                                if (!event.target.checked) {
                                  cloudinit = undefined
                                }
                                setReq({
                                  ...req,
                                  is_cloudinit: event.target.checked,
                                  disk: undefined,
                                  nic: undefined,
                                  cloudinit: cloudinit
                                })
                              }}/>
                  }
                  label="CloudInit"/>
                <p>cloudinitを利用する場合はVM名を先に記入してください</p>
              </FormGroup>
              {
                req.is_cloudinit && req.name !== "" &&
                <Card sx={{marginLeft: 2, marginRight: 10}}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      CloudInit
                    </Typography>
                    <FormControl sx={{m: 3}} component="fieldset" variant="standard">
                      <FormLabel component="legend">Template</FormLabel>
                      <Select
                        labelId="cloudinit-select-id-label"
                        id="cloudinit-select-id"
                        label="cloudinit"
                        value={req.cloudinit?.id}
                        onChange={(event) => {
                          setReq({
                            ...req, cloudinit: {
                              ...req.cloudinit ?? {id: event.target.value, image_copy: "local", name: ""},
                              id: event.target.value,
                              image_copy: "local"
                            }
                          })
                        }}
                      >
                        {
                          template?.images?.map((image) => (
                            !image.disable &&
                            <MenuItem key={image.name} value={image.name}>
                              {image.name}({image.comment})
                            </MenuItem>
                          ))
                        }
                      </Select>
                      <Select
                        labelId="cloudinit-spec-select-id-label"
                        id="cloudinit-spec-select-id"
                        label="spec_plan"
                        // value={host}
                        onChange={(event) => {
                          let spec = template?.images?.find(image => image.name === req.cloudinit?.id)?.spec_plans?.find(spec => (spec.name === event.target.value))
                          if (spec === undefined) {
                            return
                          }
                          setReq({
                            ...req,
                            arch: getArchID(spec.arch), cpu: spec.cpu, memory: spec.memory, boot: "hd"
                          })
                        }}
                      >
                        {
                          template?.images?.find(image => image.name === req.cloudinit?.id)?.spec_plans?.map((spec) => (
                            !spec.disable &&
                            <MenuItem key={spec.name} value={spec.name}>
                              [{spec.name}] {spec.cpu}/{spec.memory}MB
                            </MenuItem>
                          ))
                        }
                      </Select>
                      <Select
                        labelId="cloudinit-storage-select-id-label"
                        id="cloudinit-storage-select-id"
                        label="storage_plan"
                        // value={host}
                        onChange={(event) => {
                          let valueSplit = (event.target.value as string).split('/')
                          let storage = template?.images?.find(image => image.name === req.cloudinit?.id)?.storage_plans?.find(storage => ((event.target.value as string).includes(storage.name)))
                          if (storage === undefined) {
                            return
                          }
                          setReq({
                            ...req, disk: [{
                              path: storage.storage_id,
                              size: Number(valueSplit[valueSplit.length - 1])
                            }]
                          })
                        }}
                      >
                        {
                          template?.images?.find(image => image.name === req.cloudinit?.id)?.storage_plans?.map((storage) => (
                            storage.size.map((size) => (
                              !storage.disable &&
                              <MenuItem key={storage.name + "/" + size} value={storage.name + "/" + size}>
                                {storage.name}({storage.storage_id}/{size}MB)
                              </MenuItem>
                            ))
                          ))
                        }
                      </Select>
                    </FormControl>
                    <FormControl sx={{m: 3}} component="fieldset" variant="standard">
                      <FormLabel component="legend">Option</FormLabel>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox checked={req.cloudinit?.userdata?.packages_update}
                                      name="packages_update"
                                      onChange={(event) => {
                                        setReq({
                                          ...req, cloudinit: {
                                            ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                            userdata: {
                                              ...req.cloudinit?.userdata,
                                              packages_update: event.target.checked
                                            }
                                          }
                                        })
                                      }}/>
                          }
                          label="packages_update"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox checked={req.cloudinit?.userdata?.packages_upgrade}
                                      name="packages_upgrade"
                                      onChange={(event) => {
                                        setReq({
                                          ...req, cloudinit: {
                                            ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                            userdata: {
                                              ...req.cloudinit?.userdata,
                                              packages_upgrade: event.target.checked
                                            }
                                          }
                                        })
                                      }}/>
                          }
                          label="packages_upgrade"
                        />
                      </FormGroup>
                    </FormControl>
                    <br/>
                    <FormControl sx={{m: 3}} component="fieldset" variant="standard">
                      <Typography variant="h6" component="div">Install Packages</Typography>
                      <br/>
                      <Stack direction="row">
                        {
                          req.cloudinit?.userdata?.packages?.map((package_name: string, index) => (
                            <Chip key={"cloudinit_package_" + index} color="primary" label={package_name}
                                  sx={{marginRight: 0.5, marginBottom: 0.5}}
                                  onDelete={() => deleteCloudinitPackage(index)}/>
                          ))
                        }
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          required
                          id={"cloudinit_package"}
                          label="package"
                          sx={{m: 1, width: '30ch'}}
                          value={inputPackage}
                          onChange={(event) => {
                            setInputPackage(event.target.value)
                          }}
                        />
                        <Button size="small" variant="contained"
                                onClick={() => addCloudinitPackage(inputPackage)}>追加</Button>
                      </Stack>
                    </FormControl>
                    <Typography variant="h6" component="div">Root User</Typography>
                    <br/>
                    <Box key={'cloudinit_user'}>
                      <TextField
                        required
                        id={"cloudinit_user"}
                        label="username"
                        sx={{m: 1, width: '30ch'}}
                        value={req.cloudinit?.userdata?.user ?? ""}
                        onChange={(event) => {
                          setReq({
                            ...req, cloudinit: {
                              ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                              userdata: {...req.cloudinit?.userdata, user: event.target.value}
                            }
                          })
                        }}
                      />
                      <TextField
                        required
                        id={"cloudinit_password"}
                        label="password"
                        sx={{m: 1, width: '30ch'}}
                        value={req.cloudinit?.userdata?.password ?? ""}
                        onChange={(event) => {
                          setReq({
                            ...req, cloudinit: {
                              ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                              userdata: {...req.cloudinit?.userdata, password: event.target.value}
                            }
                          })
                        }}
                        type="password"
                      />
                      <TextField
                        required
                        id={"cloudinit_password_verify"}
                        label="password verify"
                        sx={{m: 1, width: '30ch'}}
                        value={req.cloudinit?.userdata?.password_verify ?? ""}
                        onChange={(event) => {
                          setReq({
                            ...req, cloudinit: {
                              ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                              userdata: {...req.cloudinit?.userdata, password_verify: event.target.value}
                            }
                          })
                        }}
                        type="password_verify"
                      />
                      <br/>
                      <Typography variant="h6" component="div">SSH Authorized Keys</Typography>
                      <br/>
                      {
                        req.cloudinit?.userdata?.ssh_authorized_keys?.map((sshKey: string, index) => (
                          <Chip key={"cloudinit_ssh_authorized_keys_" + index}
                                color="primary"
                                label={sshKey}
                                sx={{marginRight: 0.5, marginBottom: 0.5}}
                                onDelete={() => {
                                  let baseSSHAuthorizedKeys = req.cloudinit?.userdata?.ssh_authorized_keys ?? []
                                  let sshAuthorizedKeys = undefined
                                  if ((baseSSHAuthorizedKeys.length ?? 0) !== 0) {
                                    sshAuthorizedKeys = baseSSHAuthorizedKeys.filter((_, idx) => idx !== index)
                                  }
                                  setReq({
                                    ...req, cloudinit: {
                                      ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                      userdata: {ssh_authorized_keys: sshAuthorizedKeys}
                                    }
                                  })
                                }}/>
                        ))
                      }
                      <Stack direction="row" spacing={1}>
                        <TextField
                          required
                          id={"cloudinit_user_input_ssh_authorized_keys"}
                          label="ssh_authorized_keys"
                          sx={{m: 1, width: '100ch'}}
                          value={inputSSHAuthorizedKeys}
                          onChange={(event) => {
                            setInputSSHAuthorizedKeys(event.target.value)
                          }}
                        />
                        <Button size="small" variant="contained"
                                onClick={() => {
                                  let ssh_authorized_keys = req.cloudinit?.userdata?.ssh_authorized_keys ?? []
                                  ssh_authorized_keys.push(inputSSHAuthorizedKeys)
                                  setReq({
                                    ...req, cloudinit: {
                                      ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                      userdata: {ssh_authorized_keys}
                                    }
                                  })
                                }
                                }>追加</Button>
                      </Stack>
                      <br/>
                      <FormControlLabel
                        control={
                          <Checkbox checked={req.cloudinit?.userdata?.ssh_pwauth} name="SSHPWAuth"
                                    onChange={(event) => {
                                      setReq({
                                        ...req, cloudinit: {
                                          ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                          userdata: {
                                            ...req.cloudinit?.userdata,
                                            ssh_pwauth: event.target.checked
                                          }
                                        }
                                      })
                                    }}
                          />
                        }
                        label="SSHPWAuth"
                      />
                    </Box>
                    <Typography variant="h6" component="div">User認証</Typography>
                    <br/>
                    <FormControl sx={{m: 3}} component="fieldset" variant="standard">
                      {
                        req.cloudinit?.userdata?.users?.map((user: InputCloudinitUser, index) => (
                          <Box key={'cloudinit_user_' + index}>
                            <Chip label={index + 1} variant="outlined"/>
                            <TextField
                              required
                              id={"cloudinit_user_" + index}
                              label="username"
                              sx={{m: 1, width: '30ch'}}
                              value={user.name ?? ""}
                              onChange={(event) => {
                                let users = req.cloudinit?.userdata?.users
                                if (users !== undefined) {
                                  users[index].name = event.target.value
                                  setReq({
                                    ...req, cloudinit: {
                                      ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                      userdata: {...req.cloudinit?.userdata, users}
                                    }
                                  })
                                }
                              }}
                            />
                            <TextField
                              required
                              id={"cloudinit_password_" + index}
                              label="password"
                              sx={{m: 1, width: '30ch'}}
                              value={user.password ?? ""}
                              onChange={(event) => {
                                let users = req.cloudinit?.userdata?.users
                                if (users !== undefined) {
                                  users[index].password = event.target.value
                                  setReq({
                                    ...req, cloudinit: {
                                      ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                      userdata: {...req.cloudinit?.userdata, users}
                                    }
                                  })
                                }
                              }}
                              type="password"
                            />
                            <TextField
                              required
                              id={"cloudinit_password_verify_" + index}
                              label="password verify"
                              sx={{m: 1, width: '30ch'}}
                              value={user.password_verify ?? ""}
                              onChange={(event) => {
                                let users = req.cloudinit?.userdata?.users
                                if (users !== undefined) {
                                  users[index].password_verify = event.target.value
                                  setReq({
                                    ...req, cloudinit: {
                                      ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                      userdata: {...req.cloudinit?.userdata, users}
                                    }
                                  })
                                }
                              }}
                              type="password_verify"
                            />
                            <br/>
                            <Typography variant="h6" component="div">Sudo</Typography>
                            <br/>
                            {
                              user.sudo?.map((sudo: string, index2) => (
                                <Chip key={"cloudinit_user_" + index + "_sudo_" + index2} color="primary"
                                      label={sudo}
                                      sx={{marginRight: 0.5, marginBottom: 0.5}}
                                      onDelete={() => deleteCloudinitSudo(index, index2)}/>
                              ))
                            }
                            <Stack direction="row" spacing={1}>
                              <TextField
                                required
                                id={"cloudinit_user_" + index + "_input_sudo"}
                                label="sudo"
                                sx={{m: 1, width: '30ch'}}
                                value={inputSudo}
                                onChange={(event) => {
                                  setInputSudo(event.target.value)
                                }}
                              />
                              <Button size="small" variant="contained"
                                      onClick={() => addCloudinitSudo(inputSudo, index)}>追加</Button>
                            </Stack>
                            <br/>
                            <Typography variant="h6" component="div">SSH Authorized Keys</Typography>
                            <br/>
                            {
                              user.ssh_authorized_keys?.map((sshKey: string, index2) => (
                                <Chip key={"cloudinit_user_" + index + "_ssh_authorized_keys_" + index2}
                                      color="primary"
                                      label={sshKey}
                                      sx={{marginRight: 0.5, marginBottom: 0.5}}
                                      onDelete={() => deleteCloudinitSSHAuthorizedKeys(index, index2)}/>
                              ))
                            }
                            <Stack direction="row" spacing={1}>
                              <TextField
                                required
                                id={"cloudinit_user_" + index + "_input_ssh_authorized_keys"}
                                label="ssh_authorized_keys"
                                sx={{m: 1, width: '100ch'}}
                                value={inputSSHAuthorizedKeys}
                                onChange={(event) => {
                                  setInputSSHAuthorizedKeys(event.target.value)
                                }}
                              />
                              <Button size="small" variant="contained"
                                      onClick={() => addCloudinitSSHAuthorizedKeys(inputSSHAuthorizedKeys, index)}>追加</Button>
                            </Stack>
                            <br/>
                            <FormControlLabel
                              control={
                                <Checkbox checked={user?.ssh_pwauth} name="SSHPWAuth"
                                          onChange={(event) => {
                                            let users = req.cloudinit?.userdata?.users
                                            if (users !== undefined) {
                                              users[index].ssh_pwauth = event.target.checked
                                              setReq({
                                                ...req, cloudinit: {
                                                  ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                                  userdata: {...req.cloudinit?.userdata, users}
                                                }
                                              })
                                            }
                                          }}
                                />
                              }
                              label="SSHPWAuth"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox checked={user?.ssh_pwauth} name="LockPasswd"
                                          onChange={(event) => {
                                            let users = req.cloudinit?.userdata?.users
                                            if (users !== undefined) {
                                              users[index].lock_passwd = event.target.checked
                                              setReq({
                                                ...req, cloudinit: {
                                                  ...req.cloudinit ?? {id: "", image_copy: "", name: ""},
                                                  userdata: {...req.cloudinit?.userdata, users}
                                                }
                                              })
                                            }
                                          }}
                                />
                              }
                              label="LockPasswd"
                            />
                            {
                              index !== 0 && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color={'error'}
                                  sx={{m: 2}}
                                  onClick={() => deleteCloudinitUser(index)}
                                >
                                  削除
                                </Button>
                              )
                            }
                          </Box>
                        ))}
                    </FormControl>
                    <Button variant="contained" size="small" onClick={() => addCloudinitUser()}>
                      追加
                    </Button>
                  </CardContent>
                </Card>
              }
              {
                !req.is_cloudinit &&
                <Card sx={{marginLeft: 2, marginRight: 10}}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      storage
                    </Typography>
                    <br/>
                    {
                      req.disk?.map((storage: InputStorage, index) => (
                        <Box key={'storage_' + index}>
                          <Chip label={index + 1} variant="outlined"/>
                          <FormControl sx={{m: 1, width: '30ch'}}>
                            <InputLabel id="storage-select-label">
                              Storage
                            </InputLabel>
                            <Select
                              labelId="storage-select-label"
                              id="storage-select"
                              value={storage.path ?? ''}
                              label="storage"
                              onChange={(event) => {
                                setReq((prevState) => {
                                  return {
                                    ...prevState, disk: prevState.disk?.map((oldItem, oldIdx) => {
                                      if (oldIdx === index) {
                                        return {
                                          ...oldItem,
                                          name: event.target.value,
                                        }
                                      }
                                      return oldItem
                                    })
                                  }
                                })
                              }}
                            >
                              {
                                template?.storages?.map((storage: TemplateStorage) => (
                                  <MenuItem key={storage.name} value={storage.name}>
                                    {storage.name}({storage.comment})
                                  </MenuItem>
                                ))
                              }
                            </Select>
                          </FormControl>
                          {
                            (
                              template?.storages !== undefined &&
                              (template?.storages.find((storage) => req.disk !== undefined && storage.name === req.disk[index].path
                              )?.option.is_iso)
                            ) && (
                              // inputStorages[index]. ?? ""
                              <FormControl sx={{m: 1, width: '30ch'}}>
                                <InputLabel id="image-list-select-label">
                                  Image List
                                </InputLabel>
                                <Select
                                  labelId="image-list-select-label"
                                  id="image-list-select"
                                  value={storage.image ?? ''}
                                  label="image-list"
                                  onChange={(event) => {
                                    setReq((prevState) => {
                                      return {
                                        ...prevState, disk: prevState.disk?.map((oldItem, oldIdx) => {
                                          if (oldIdx === index) {
                                            return {
                                              ...oldItem,
                                              image: event.target.value,
                                            }
                                          }
                                          return oldItem
                                        })
                                      }
                                    })
                                  }}
                                >
                                  {
                                    template?.list.find((image) =>
                                      req.disk !== undefined && image.name === req.disk[index].path
                                    )?.path?.map((storageList, idx) => (
                                      <MenuItem key={"storageList_" + idx} value={storageList}>
                                        {storageList}
                                      </MenuItem>
                                    ))
                                  }
                                </Select>
                              </FormControl>
                            )}
                          <TextField
                            required
                            id="size"
                            label="size"
                            type="number"
                            sx={{m: 1, width: '15ch'}}
                            value={storage.size ?? 0}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">MB</InputAdornment>
                              ),
                            }}
                            onChange={(event) => {
                              setReq((prevState) => {
                                return {
                                  ...prevState, disk: prevState.disk?.map((oldItem, oldIdx) => {
                                    if (oldIdx === index) {
                                      return {
                                        ...oldItem,
                                        size: Number(event.target.value),
                                      }
                                    }
                                    return oldItem
                                  })
                                }
                              })
                            }}
                          />
                          {
                            index !== 0 && (
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
                                  if (req.disk !== undefined) {
                                    let newArr = req.disk.concat()
                                    newArr[index] = req.disk[index - 1]
                                    newArr[index - 1] = req.disk[index]
                                    setReq({...req, disk: newArr})
                                  }
                                }}
                              >
                                ↑
                              </Button>
                            )}
                            {req.disk?.length !== 1 &&
                              req.disk?.length !== index + 1 && (
                                <Button
                                  size="small"
                                  onClick={() => {
                                    if (req.disk !== undefined) {
                                      let newArr = req.disk.concat()
                                      newArr[index + 1] = req.disk[index]
                                      newArr[index] = req.disk[index + 1]
                                      setReq({...req, disk: newArr})
                                    }
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
                    <Button variant="contained" size="small" onClick={() => addStorage()}>
                      追加
                    </Button>
                  </CardActions>
                </Card>}
              <br/>
              <Card sx={{marginLeft: 2, marginRight: 10, marginBottom: 1}}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    NIC
                  </Typography>
                  <br/>
                  {
                    req.nic?.map((nic: InputNIC, index) => (
                      <Box key={'nic_' + index}>
                        <Chip label={index + 1} variant="outlined"/>
                        <FormControl sx={{m: 1, width: '30ch'}}>
                          <InputLabel id="nic-select-label">NIC</InputLabel>
                          <Select
                            labelId="nic-select-label"
                            id="nic-select"
                            defaultValue={""}
                            value={nic.device ?? ''}
                            label="nic"
                            onChange={(event) => {
                              setReq((prevState) => {
                                return {
                                  ...prevState, nic: prevState.nic?.map((oldItem, oldIdx) => {
                                    if (oldIdx === index) {
                                      return {
                                        ...oldItem,
                                        device: event.target.value,
                                      }
                                    }
                                    return oldItem
                                  })
                                }
                              })
                            }}
                          >
                            {
                              template?.nics?.map((nic: TemplateNIC, idx) => (
                                <MenuItem key={"nic_" + idx} value={nic.interface}>
                                  {nic.name}({nic.comment})
                                </MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                        <br/>
                        {
                          req.is_cloudinit &&
                          <Box>
                            <Stack direction="row" spacing={0.5}>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <TextField
                                required
                                id={"cloudinit_network_" + index + "_ip-address"}
                                label="IP Address"
                                sx={{width: '30ch'}}
                                value={nic.cloudinit?.address ?? ""}
                                onChange={(event) => {
                                  let nics = req.nic?.concat() ?? []
                                  nics[index] = {
                                    ...nics[index] ?? {name: ""},
                                    cloudinit: {
                                      ...nics[index].cloudinit ?? {
                                        name: "",
                                        address: event.target.value,
                                        gateway: "",
                                        netmask: ""
                                      },
                                      address: event.target.value
                                    }
                                  }
                                  setReq({...req, nic: nics})
                                }}
                              />
                              <TextField
                                required
                                id={"cloudinit_network_" + index + "_netmask"}
                                label="netmask"
                                sx={{width: '30ch'}}
                                value={nic.cloudinit?.netmask ?? ""}
                                onChange={(event) => {
                                  let nics = req.nic?.concat() ?? []
                                  nics[index] = {
                                    ...nics[index] ?? {name: ""},
                                    cloudinit: {
                                      ...nics[index].cloudinit ?? {
                                        name: "",
                                        address: "",
                                        gateway: "",
                                        netmask: event.target.value
                                      },
                                      netmask: event.target.value
                                    }
                                  }
                                  setReq({...req, nic: nics})
                                }}
                              />
                              <TextField
                                required
                                id={"cloudinit_network_" + index + "_gateway"}
                                label="gateway"
                                sx={{width: '30ch'}}
                                value={nic.cloudinit?.gateway ?? ""}
                                onChange={(event) => {
                                  let nics = req.nic?.concat() ?? []
                                  nics[index] = {
                                    ...nics[index] ?? {name: ""},
                                    cloudinit: {
                                      ...nics[index].cloudinit ?? {
                                        name: "",
                                        address: "",
                                        gateway: event.target.value,
                                        netmask: ""
                                      },
                                      gateway: event.target.value
                                    }
                                  }
                                  setReq({...req, nic: nics})
                                }}
                              />
                            </Stack>
                            <Typography variant="h6" component="div">DNS</Typography>
                            <br/>
                            {
                              nic.cloudinit?.dns?.map((dns: string, index2) => (
                                <Chip key={"nic_" + index + "_cloudinit_dns_" + index2} color="primary"
                                      label={dns}
                                      sx={{marginRight: 0.5, marginBottom: 0.5}}
                                      onDelete={() => deleteCloudinitDNS(index, index2)}/>
                              ))
                            }
                            <Stack direction="row" spacing={1}>
                              <TextField
                                required
                                id={"nic_" + index + "_cloudinit_dns_input"}
                                label="dns"
                                sx={{m: 1, width: '30ch'}}
                                value={inputDNS}
                                onChange={(event) => {
                                  setInputDNS(event.target.value)
                                }}
                              />
                              <Button size="small" variant="contained"
                                      onClick={() => addCloudinitDNS(inputDNS, index)}>追加</Button>
                            </Stack>
                          </Box>
                        }
                        {
                          index !== 0 && (
                            <Button
                              size="small"
                              variant="contained"
                              color={'error'}
                              sx={{m: 2}}
                              onClick={() => deleteNIC(index)}
                            >
                              削除
                            </Button>
                          )
                        }
                        <ButtonGroup>
                          {
                            index !== 0 && (
                              <Button
                                size="small"
                                onClick={() => {
                                  if (req.nic !== undefined) {
                                    let newArr = req.nic.concat()
                                    newArr[index] = req.nic[index - 1]
                                    newArr[index - 1] = req.nic[index]
                                    setReq({...req, nic: newArr})
                                  }
                                }}
                              >
                                ↑
                              </Button>
                            )}
                          {
                            req.nic?.length !== 1 &&
                            req.nic?.length !== index + 1 && (
                              <Button
                                size="small"
                                onClick={() => {
                                  if (req.nic !== undefined) {
                                    let newArr = req.nic.concat()
                                    newArr[index + 1] = req.nic[index]
                                    newArr[index] = req.nic[index + 1]
                                    setReq({...req, nic: newArr})
                                  }
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
                  <Button variant="contained" size="small" onClick={() => addNIC()}>
                    追加
                  </Button>
                </CardActions>
              </Card>
            </Card>
            <br/>
          </Grid>
          <Button variant="contained" size="small" onClick={() => create()}>
            作成
          </Button>
          <Button size="small" onClick={() => {
            console.log("template", template)
            console.log("req", req)
          }
          }>
            Request結果(DEBUG)
          </Button>
          <Grid item xs={12}>
            <h2>状況</h2>
            <h5>Templateコピー進捗</h5>
            {
              (result?.data ?? false) && (result?.data.copy_progress ?? false) && (
                <LinearProgressWithLabel variant="determinate" value={Number(result?.data.copy_progress ?? 0)}/>
              )
            }
            <h5>VM作成全体の進捗</h5>
            {
              (result?.data ?? false) && (result?.data.create_progress ?? false) && (
                <LinearProgressWithLabel variant="determinate" value={Number(result?.data.create_progress ?? 0)}/>
              )
            }
            {
              (result?.data ?? false) && (result?.data.message ?? false) && (
                <b>{result?.data.message}</b>
              )
            }
            {
              (result?.error ?? false) && (
                <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  <b>{result?.error ?? "エラーなし"}</b>
                </Alert>
              )
            }
            <h3>詳細</h3>
            {JSON.stringify(result)}
          </Grid>
        </Grid>
      </Container>
    </Base>
  )
}
