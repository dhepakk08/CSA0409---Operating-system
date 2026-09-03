#include <stdio.h>
#include <pthread.h>

void *display()
{
    printf("Hello from Thread!\n");
    return NULL;
}

int main()
{
    pthread_t t1;

    pthread_create(&t1, NULL, display, NULL);

    pthread_join(t1, NULL);

    printf("Main Thread Finished\n");

    return 0;
}