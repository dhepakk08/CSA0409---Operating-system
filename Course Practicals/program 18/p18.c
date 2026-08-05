#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>

int buffer[5], in=0, out=0;

sem_t empty, full, mutex;

void *producer()
{
    int item;
    for(int i=0;i<5;i++)
    {
        item=i+1;

        sem_wait(&empty);
        sem_wait(&mutex);

        buffer[in]=item;
        printf("Produced: %d\n",item);
        in++;

        sem_post(&mutex);
        sem_post(&full);
    }
}

void *consumer()
{
    int item;

    for(int i=0;i<5;i++)
    {
        sem_wait(&full);
        sem_wait(&mutex);

        item=buffer[out];
        printf("Consumed: %d\n",item);
        out++;

        sem_post(&mutex);
        sem_post(&empty);
    }
}

int main()
{
    pthread_t p,c;

    sem_init(&empty,0,5);
    sem_init(&full,0,0);
    sem_init(&mutex,0,1);

    pthread_create(&p,NULL,producer,NULL);
    pthread_create(&c,NULL,consumer,NULL);

    pthread_join(p,NULL);
    pthread_join(c,NULL);

    return 0;
}