#include <stdio.h>
#include <pthread.h>

void *display(void *arg)
{
    printf("Hello from Thread!\n");

    return NULL;
}

int main()
{
    pthread_t thread;

    if(pthread_create(&thread, NULL, display, NULL) != 0)
    {
        printf("Thread creation failed.\n");
        return 1;
    }

    pthread_join(thread, NULL);

    printf("Back to Main Thread.\n");

    return 0;
}