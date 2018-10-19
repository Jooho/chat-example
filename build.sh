
if [[ z$1 == z ]]
then
  echo "Please specify version name : v1 or v2"
  echo "ex) ./build.sh v1"
  exit 1
fi

export tag=$1

if [[ $tag == v2 ]]
then
  export old_version=v1
else
  export old_version=v2
fi

sed -i "s/${old_version}/$tag/g" server.js

git commit -am "update version"
git push

oc start-build chat-server-example -w
docker pull $(oc get is  chat-server-example -o jsonpath='{.status.dockerImageRepository}')
docker tag $(oc get is  chat-server-example -o jsonpath='{.status.dockerImageRepository}') docker.io/ljhiyh/chat-server:$tag
docker push docker.io/ljhiyh/chat-server:$tag

