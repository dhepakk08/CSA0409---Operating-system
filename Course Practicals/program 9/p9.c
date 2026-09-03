#include <stdio.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <string.h>

int main()
{
    int shmid;
    char *str;

    shmid = shmget(1234, 1024, 0666 | IPC_CREAT);

    str = (char *)shmat(shmid, NULL, 0);

    printf("Enter message: ");
    scanf("%s", str);

    printf("Shared Memory contains: %s\n", str);

    shmdt(str);

    return 0;
}