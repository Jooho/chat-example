Chat Server 
-----------

This is the chat server developed by nodejs.

### Build ###

#### OpenShift ####
```
oc new-project chat-server
oc new-app https://github.com/Jooho/chat-server-example.git
oc start-build chat-server-example
```

*Import new image to docker hub*

Update tag and import images

```
vi build.sh
export tag=v2
..

./build.sh
```
