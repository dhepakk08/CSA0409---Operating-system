#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

#define N 5

pthread_mutex_t fork[N];

void *philosopher(void *arg)
{
    int id = *(int *)arg;
    int left = id;
    int right = (id + 1) % N;

    printf("Philosopher %d is thinking\n", id + 1);

    pthread_mutex_lock(&fork[left]);
    printf("Philosopher %d picked left fork\n", id + 1);

    pthread_mutex_lock(&fork[right]);
    printf("Philosopher %d picked right fork\n", id + 1);

    printf("Philosopher %d is eating\n", id + 1);
    sleep(1);

    pthread_mutex_unlock(&fork[right]);
    pthread_mutex_unlock(&fork[left]);

    printf("Philosopher %d finished eating\n", id + 1);

    return NULL;
}

int main()
{
    pthread_t p[N];
    int id[N];
    int i;

    for(i = 0; i < N; i++)
        pthread_mutex_init(&fork[i], NULL);

    for(i = 0; i < N; i++)
    {
        id[i] = i;
        pthread_create(&p[i], NULL, philosopher, &id[i]);
    }

    for(i = 0; i < N; i++)
        pthread_join(p[i], NULL);

    for(i = 0; i < N; i++)
        pthread_mutex_destroy(&fork[i]);

    return 0;
}