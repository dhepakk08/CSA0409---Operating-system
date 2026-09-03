#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>

sem_t mutex, writeblock;
int data=0, readcount=0;

void *reader()
{
    sem_wait(&mutex);
    readcount++;

    if(readcount==1)
        sem_wait(&writeblock);

    sem_post(&mutex);

    printf("Reader reads data: %d\n",data);

    sem_wait(&mutex);
    readcount--;

    if(readcount==0)
        sem_post(&writeblock);

    sem_post(&mutex);

}

void *writer()
{
    sem_wait(&writeblock);

    data++;
    printf("Writer writes data: %d\n",data);

    sem_post(&writeblock);
}

int main()
{
    pthread_t r,w;

    sem_init(&mutex,0,1);
    sem_init(&writeblock,0,1);

    pthread_create(&r,NULL,reader,NULL);
    pthread_create(&w,NULL,writer,NULL);

    pthread_join(r,NULL);
    pthread_join(w,NULL);

    return 0;
}