# concourse-smb-share

This is [concourse.ci](https://concourse-ci.org/) resource for retrieving from and persisting build artifacts using a shared (SMB/CIFS) storage location on windows server.

Written in [nodejs](https://nodejs.org) and internally use [smbclient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html) from [samba project](https://www.samba.org/).

## Config

Define concourse resource type:

```yaml
resource_types:
- name: smb-resource
  type: docker-image
  source:
      repository: vavere/concourse-smb-share
      tag: "1.0"
```

Every defined resource must have a path specified and optional access credentials.

- **path**: _//server/share/dir1/dir2_
- **user**: _username_ (optional)
- **pass**: _password_ (optional)

A valid **path** must contain the following parts:

1. //
2. server name or ip address
3. share name
4. path inside share: dir1/dir2/... (optional)

For example:

```yaml
resources:
- name: repo
  type: smb-resource
  source:
    path: //server/share/dir1/dir2
    user: ((user))
    pass: ((pass))
```

By default resource get/put all files from/to resource but it's posible limit this action specifying exact file names in pipeline jobs section get or put tasks using **params/files** array for example:

```yaml
jobs:
- name: demo
  plan:
  - get: repo
    params:
      files:
      - file1.txt
      - file2.txt
```

The same is true for sending files in _put_. Important say that _put_ no touch oher remote files.

It's posible disable implicit _get_ step after pipeline _put_ step setting `get_params.skip = true`, with makes sense when dealing with _put_ operations on only few specific file(s) in remote (may be full of files) folder.

Example of putting only few files from _result_ and preventing implicit _get_:

```yaml
jobs:
- name: demo
  plan:
  - put: result
    params:
      dir: result
      files:
      - file1.txt
      - file2.txt
    get_params:
      skip: true
```

You can use **files** as string with multiple names to, but no spaces un file name are alowwed:

```yaml
put: repo
  params:
    files: file1.txt file2.txt
```

## Tests

Just execute:

```bash
$ npm test
```