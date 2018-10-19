

export tag=$1
export old_version

if [[ $tag == v2 ]]
then
  old_version = v1
else
  old_version = v2
fi

sed -i "s/$old_version/$tag/g" server.js
docker pull $(oc get is  chat-server-example -o jsonpath='{.status.dockerImageRepository}')
docker tag $(oc get is  chat-server-example -o jsonpath='{.status.dockerImageRepository}') docker.io/ljhiyh/chat-server:$tag
docker push docker.io/ljhiyh/chat-server:$tag

