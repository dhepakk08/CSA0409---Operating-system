#include <stdio.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <string.h>

int main()
{
    key_t key = 1234;

    int shmid = shmget(key, 1024, 0666 | IPC_CREAT);

    if(shmid < 0)
    {
        printf("Shared memory creation failed.\n");
        return 1;
    }

    char *str = (char *)shmat(shmid, NULL, 0);

    strcpy(str, "Hello from Shared Memory!");

    printf("Data written: %s\n", str);

    shmdt(str);

    shmctl(shmid, IPC_RMID, NULL);

    return 0;
}