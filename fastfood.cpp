#include <stdio.h>
#include <string>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/shm.h>
#include <sys/types.h> 
#include <sys/ipc.h>   
#include <semaphore.h> 
#include <sys/stat.h> 
#include <fcntl.h>
#include <iostream>
#include <sstream>
#include <fstream>
#include <mutex>
#include <errno.h> 
#include <cstring>

using namespace std;
mutex mtx;
sem_t *clerks;

void serve(char input[], int time)
{
	mtx.lock();
	cout << input << " is being served." << endl;
	mtx.unlock();
	
	sleep(time);
	
	mtx.lock();
	cout << input << " has left." << endl;
	mtx.unlock();
}
int main(int argc, char* argv[])
{
	int c, value, count, i, shmid;
	string line;
	ifstream file;
	int *wait;
	key_t key = 1234;
	pid_t pid;
	
	cout << "Welcome to the restaurant! " << endl;
	/**get the number of clerks from the command line */
	c = stoi(argv[1]);
	/** initialize semaphore*/
	clerks = sem_open("myclerks",O_CREAT | O_EXCL, 0644,c);
	sem_unlink("myclerks");
	sem_getvalue(clerks, &value);
	
	/**read number of files and use it to initiate arrays**/
	file.open("input.txt");
	while(!file.eof())
	{
		getline(file,line);
		count++;
	}	
	file.close();
	//initialize customer info 
	string name[count];
	int arrival[count];
	int process[count];
	
	//read in from file
	file.open("input.txt");
	for (i = 0; i < count; i++)
	{
		file >> name[i];
		file >> arrival[i];
		file >> process[i];	
	}
	file.close();
	
	//fix the arrival time to be in time order.
	for (i = 0; i < count; i++)
		if (i > 0)
			arrival[i] = arrival[i] + arrival[i-1];
		
	/**initialize shared memory int - number of people having to wait*/
	shmid=shmget(key,sizeof(int),IPC_CREAT | 0666);
	wait = (int *)shmat(shmid,0,0);
	*wait = 0;
	
	/**fork child processes*/
	for (i = 0; i < count; i++)
	{
		pid = fork();
		if (pid < 0)
			cout << "Fork error" << endl;
		else if (pid == 0)
			break;
	}
	
	/**PARENT PROCESS*/
	if (pid != 0)
	{
        /* wait for all children to exit */
        while (pid = waitpid (-1, NULL, 0)){
            if (errno == ECHILD)
                break;
        }
	
		/*Print out the final statements */
		cout << " " << endl;
        cout << "All customers have left, here's how we did today:" << endl;
		cout << "Number of customers served: " << count << endl;
		cout << "Number of customers not having to wait: " << count - *wait << endl ;
		cout << "Number of customers that waited: " << *wait << endl;

        /* shared memory detach */
        shmdt (wait);
        shmctl (shmid, IPC_RMID, 0);

        /* cleanup semaphores */
        exit (0);
	}
	/**CHILD PROCESS*/
	else
	{
		
		/*send child into the restaurant*/
		sleep(arrival[i]);
		mtx.lock();
		cout << name[i] << " has arrived." << endl;
		mtx.unlock();
		 
		//copy string to char array
		int n = name[i].length();
		char * thename = new char [n+1];
		strcpy(thename, name[i].c_str());
		
		/*see if customer has to wait*/
		mtx.lock();
		sem_getvalue(clerks, &value);
		if (value == 0)
			*wait += 1; 
		mtx.unlock();
		sem_wait(clerks);
		serve(thename, process[i]);
		sem_post(clerks);
		
		exit(0);
	}
	return 0;
}