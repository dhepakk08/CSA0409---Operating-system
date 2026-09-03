#include <stdio.h>
#include <pthread.h>

char message[100];
pthread_t thread_id;

void *thread_function(void *arg)
{
    printf("\nThread Created Successfully\n");
    printf("Message: %s\n", message);

    if (pthread_equal(thread_id, pthread_self()))
        printf("Thread IDs are Equal\n");
    else
        printf("Thread IDs are Not Equal\n");

    printf("Thread is Exiting\n");

    pthread_exit(NULL);
}

int main()
{
    pthread_t t;

    printf("Enter a message: ");
    scanf(" %[^\n]", message);

    // Create thread
    pthread_create(&t, NULL, thread_function, NULL);

    // Store thread ID
    thread_id = t;

    // Join thread
    pthread_join(t, NULL);

    printf("\nMain Thread: Child thread completed\n");

    return 0;
}