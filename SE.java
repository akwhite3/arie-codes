//Project

import java.util.*;
import java.io.*;
import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.lang.*;
import java.time.*;
import java.time.format.*;

public class SE
{
	private JFrame theWindow;	// Window
	private JPanel controlPanel, infoPanel;	// Panels for the
					// control buttons and the information
	private JButton listDay, quit;
					// JButtons for program actions
	private JTextArea info;	// See JTextArea in Java API
	private Container thePane;
	private ControlListener theListener;
	
	public SE() throws IOException
	{
		//Main control panel of Project
		controlPanel = new JPanel();
		controlPanel.setLayout(new GridLayout(2,1));

		listDay = new JButton("Find out what day you were born");
		quit = new JButton("Quit");

		theListener = new ControlListener();
		listDay.addActionListener(theListener);
		quit.addActionListener(theListener);

		controlPanel.add(listDay);
		controlPanel.add(quit);
		
		//info panel for the answer
		infoPanel = new JPanel();
		infoPanel.setLayout(new FlowLayout());
		info = new JTextArea();
		info.setColumns(40);
		infoPanel.add(info);

		theWindow = new JFrame("Birth Day Finder");
		// Don't quit the program when "X" is clicked -- user
		// must use the Quit button
		theWindow.setDefaultCloseOperation(
				WindowConstants.DO_NOTHING_ON_CLOSE);
		thePane = theWindow.getContentPane();
		thePane.add(controlPanel, BorderLayout.NORTH);
		thePane.add(infoPanel, BorderLayout.SOUTH);
		// pack() to size JFrame as needed
		theWindow.pack();
		theWindow.setVisible(true);
	}

	//actions for the buttons 
	private class ControlListener implements ActionListener 
	{
		public void actionPerformed(ActionEvent e)
		{
			Scanner inScan = new Scanner(System.in);
			if (e.getSource() == listDay)
			{
				String year = null;
				String month = null;
				String day = null;
				//Put in a loop to make sure the format is correct
				boolean y=false;
				while(!y)
				{
					/**Ask for the year*/
					year = JOptionPane.showInputDialog("What year were you born? (Format: YYYY)");
					if (year.length()!=4 || !(year.chars().allMatch(Character::isDigit)))
						//the year isn't in the right format
						info.setText("Please enter the right format");
					else 
						y=true;
				}
				/**Ask for month*/
				boolean m=false;
				while(!m)
				{
					/**Ask for the year*/
					month = JOptionPane.showInputDialog("What month were you born? (Format: M or MM)");
					if (month.length() > 2 || !(month.chars().allMatch(Character::isDigit)))
						//the month isn't in the right format
						info.setText("Please enter the right format");
					else 
					{
						if (Integer.valueOf(month)<=12)
							m=true;
						else
							info.setText("Please enter a valid month");
					}
				}
				/**Ask for day*/
				boolean d=false;
				while(!d)
				{
					/**Ask for the year*/
					day = JOptionPane.showInputDialog("What date were you born? (Format:DD)");
					if (day.length()!=2 || !(day.chars().allMatch(Character::isDigit)))
					{
						//the day isn't in the right format
						info.setText("Please enter the right format");
						d=false;
					}
					else 
					{
						if (Integer.valueOf(month)==1||Integer.valueOf(month)==3||Integer.valueOf(month)==5||Integer.valueOf(month)==7||Integer.valueOf(month)==8||Integer.valueOf(month)==10||Integer.valueOf(month)==12)
						{
							if (Integer.valueOf(day)<=31)
								d=true;
							else 
								info.setText("Please enter a valid day");
						}
						else if (Integer.valueOf(month)==4||Integer.valueOf(month)==6||Integer.valueOf(month)==9||Integer.valueOf(month)==11)	
						{
							if (Integer.valueOf(day)<=30)
								d=true;
							else
								info.setText("Please enter a valid day");
						}
						else //leap year case
						{
							if ((Integer.valueOf(year))%400==0||Integer.valueOf(year))%4==0 && Integer.valueOf(year))%100!=0)
							{
								if(Integer.valueOf(day)<=29)
									d=true;
								else
									info.setText("Please enter a valid day");
							}
							else
							{
								if(Integer.valueOf(day)<=28)
									d=true;
								else
									info.setText("Please enter a valid day");
							}
						}
					}
				}
				
				
				String dateOfbirth =  month + "/" + day + "/" + year ;
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/dd/yyyy");
				LocalDate date = LocalDate.parse(dateOfbirth, formatter); //formats date
				DayOfWeek dow = date.getDayOfWeek();  // gets day of week
				String output = dow.getDisplayName(TextStyle.FULL, Locale.US); // format of day*/
				info.setText("You were born: "+month+"/"+day+"/"+year+". The day of the week was "+output+".");
				theWindow.pack();
			}
			if (e.getSource() == quit)
			{
				int reply = JOptionPane.showConfirmDialog(null, "Are you sure?", "Quit ? ", JOptionPane.YES_NO_OPTION);
				if (reply == JOptionPane.YES_OPTION)
				{
					System.exit(reply);
				}
			}
		}
	}
	// A "one line" main here just creates a SE object
	public static void main(String [] args) throws IOException
	{
		new SE();
	}
}



