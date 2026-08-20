#include <stdio.h>

#define SIZE 5

int buffer[SIZE];
int in = 0, out = 0;

int empty = SIZE;
int full = 0;
int mutex = 1;

void wait(int *s)
{
    while (*s <= 0);
    (*s)--;
}

void signal(int *s)
{
    (*s)++;
}

void producer(int item)
{
    wait(&empty);
    wait(&mutex);

    buffer[in] = item;
    printf("Produced: %d\n", item);
    in = (in + 1) % SIZE;

    signal(&mutex);
    signal(&full);
}

void consumer()
{
    int item;

    wait(&full);
    wait(&mutex);

    item = buffer[out];
    printf("Consumed: %d\n", item);
    out = (out + 1) % SIZE;

    signal(&mutex);
    signal(&empty);
}

int main()
{
    int n, i;

    printf("Enter number of items: ");
    scanf("%d", &n);

    printf("\n--- Producer-Consumer Simulation ---\n");

    for (i = 1; i <= n; i++)
    {
        producer(i);

        if (i % 2 == 0)
            consumer();
    }

    /* Consume remaining items */
    while (full > 0)
        consumer();

    printf("\nAll items produced and consumed successfully.\n");

    return 0;
}