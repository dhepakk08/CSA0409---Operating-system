#include <stdio.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <string.h>

struct msg
{
    long type;
    char text[100];
};

int main()
{
    struct msg m;

    int id = msgget(1234, 0666 | IPC_CREAT);

    m.type = 1;

    printf("Enter Message: ");
    scanf("%s", m.text);

    msgsnd(id, &m, sizeof(m.text), 0);

    msgrcv(id, &m, sizeof(m.text), 1, 0);

    printf("Received Message: %s", m.text);

    return 0;
}