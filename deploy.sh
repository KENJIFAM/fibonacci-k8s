docker build -t kenjifam/multi-client:latest -t stephengrider/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t kenjifam/multi-server:latest -t stephengrider/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t kenjifam/multi-worker:latest -t stephengrider/multi-worker:$SHA -f ./worker/Dockerfile ./worker
  
docker push kenjifam/multi-client:latest
docker push kenjifam/multi-server:latest
docker push kenjifam/multi-worker:latest

docker push kenjifam/multi-client:$SHA
docker push kenjifam/multi-server:$SHA
docker push kenjifam/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=kenjifam/multi-server:$SHA
kubectl set image deployments/client-deployment client=kenjifam/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=kenjifam/multi-worker:$SHA